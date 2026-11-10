---
title: "Database Setup"
---

HappyView supports two database backends: **SQLite** (default) and **PostgreSQL**. The backend is auto-detected from your `DATABASE_URL` scheme, or you can set `DATABASE_BACKEND` explicitly.

## SQLite (default)

SQLite requires zero setup. HappyView creates the database file automatically on first startup.

```sh
DATABASE_URL=sqlite://data/happyview.db?mode=rwc
```

The `?mode=rwc` parameter tells SQLite to create the file if it does not exist. The path is relative to the working directory (or use an absolute path).

**When to use SQLite:**

- Getting started or local development
- Small to medium deployments
- Single-server setups where simplicity is preferred

## PostgreSQL (optional)

For larger deployments or when you need concurrent write scalability, use Postgres.

```sh
DATABASE_URL=postgres://happyview:happyview@localhost/happyview
```

You need to create the database before starting HappyView:

```sh
createdb happyview
```

HappyView runs migrations automatically on startup for both backends.

**When to use Postgres:**

- High write concurrency from many simultaneous users
- You need Postgres-specific features (e.g., advanced JSON queries in Lua scripts)
- You already have a Postgres infrastructure

## Environment variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Connection string. `sqlite://...` for SQLite, `postgres://...` for Postgres |
| `DATABASE_BACKEND` | Optional. Force `sqlite` or `postgres`. Auto-detected from `DATABASE_URL` if not set |
| `PLUGIN_SQL_DATABASE_URL` | Optional, Postgres only. Runs Lua `db.raw` as the unprivileged `happyview_plugin` role. See [Least-privileged `db.raw`](#least-privileged-dbraw-postgres) |

## Least-privileged `db.raw` (Postgres)

From 2.17.3, on Postgres, you can run Lua `db.raw` as its own unprivileged database role. `db.raw` then runs on a separate connection pool that logs in as `happyview_plugin`. That role is granted only the tables `db.raw` may use (see [Protected tables](../../api-reference/lua/database-api.md#protected-tables)), so the database itself refuses anything else. We recommend it for every Postgres instance whose scripts use `db.raw`. SQLite needs no setup.

1. Create the login role in HappyView's database. Don't grant it any role or privilege yourself: HappyView grants exactly what it needs at boot, and refuses a role with role memberships or extra privileges like these.

   ```sql
   CREATE ROLE happyview_plugin LOGIN PASSWORD '<a long random password>';
   ```

2. Point HappyView at it, using the same host and database as `DATABASE_URL`:

   ```sh
   PLUGIN_SQL_DATABASE_URL=postgres://happyview_plugin:<password>@localhost/happyview
   ```

3. Restart HappyView. The boot log says `db.raw runs on the dedicated login pool` once it's in use.

At boot, HappyView creates a `happyview_plugin` schema and grants the role the allowed tables, plus the tables your scripts created in `public` before this was set up. Tables a script creates from then on go in the `happyview_plugin` schema, which `db.raw` searches first. Name them without the `happyview_` prefix: `db.raw` refuses to run while that schema holds a table, view, sequence or index named `happyview_…`, until you drop it.

HappyView checks the role before using it. It refuses a role that is a superuser, can create roles or databases, can replicate or bypass row security, is HappyView's own database role, is a member of any role, can read a protected table, or can create in `public`.

<Callout type="warn" title="A set but unusable URL turns db.raw off">
If `PLUGIN_SQL_DATABASE_URL` is set but HappyView can't connect with it, or the role fails those checks, HappyView refuses `db.raw` rather than falling back to its main connection. The rest of HappyView keeps running. The boot log says why. Fix the role or the URL and restart.
</Callout>

Without `PLUGIN_SQL_DATABASE_URL`, `db.raw` runs on HappyView's main connection behind the [protected-table check](../../api-reference/lua/database-api.md#protected-tables), as before. If the `happyview_plugin` schema contains functions or triggers, HappyView refuses `db.raw` until the URL is set again or they are dropped.

## Docker Compose

The default `docker-compose.yml` ships with the Postgres service commented out. To use Postgres:

1. Uncomment the `postgres` service and `pgdata` volume in `docker-compose.yml`
2. Uncomment the `depends_on: postgres` block in the `happyview` service
3. Update `DATABASE_URL` in `.env`:
   ```sh
   DATABASE_URL=postgres://happyview:happyview@postgres/happyview
   ```
4. Set the Postgres credentials:
   ```sh
   POSTGRES_USER=happyview
   POSTGRES_PASSWORD=happyview
   POSTGRES_DB=happyview
   ```

## Lua scripts

Both backends support the same Lua database API (`db.query`, `db.get`, `db.count`). Write SQL in **SQLite syntax** by default. If you are using Postgres, HappyView automatically translates common SQLite patterns to Postgres equivalents at runtime.

If you are migrating existing Lua scripts from Postgres SQL syntax to SQLite syntax, see the [Postgres to SQLite migration guide](postgres-to-sqlite-migration.md).

## Next steps

- [SQLite → Postgres migration](sqlite-to-postgres-migration.md) — switch an existing instance from SQLite to Postgres
- [Postgres → SQLite migration](postgres-to-sqlite-migration.md) — switch an existing instance from Postgres to SQLite
- [Lua scripting](../lua-scripting.md) — write queries that target either backend
- [Configuration](../../getting-started/configuration.md) — `DATABASE_URL` and related variables
