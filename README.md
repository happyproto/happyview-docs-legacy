# HappyView v2 docs

The documentation for HappyView 2.x, served at [v2.happyview.dev](https://v2.happyview.dev). It's a [Fumadocs](https://fumadocs.dev) site on Next.js, deployed by Vercel.

The current docs, for HappyView v3, live in [happyproto/happyview-docs](https://github.com/happyproto/happyview-docs) and are served at [happyview.dev/docs](https://happyview.dev/docs/). So does the blog.

## Where this came from

This repo was split out of [gamesgamesgamesgamesgames/happyview](https://github.com/gamesgamesgamesgamesgames/happyview) at tag `v2.17.0` (`9bcf9ac9b62c9a26bc7d333f2a0f848856cac5a5`), with the history of `packages/docs` and `packages/design-system` kept. `#123`-style references in older commit messages point at the HappyView repo.

## Editing

v2 is the stable line and takes fixes. A HappyView change that alters documented v2 behaviour needs a companion pull request here. Vercel posts a preview on each pull request, and merging to `main` deploys.

```sh
bun install
bun run dev
```

`bun run build` also regenerates the changelog pages from HappyView's v2 releases. Set `GITHUB_TOKEN` to avoid GitHub's rate limit.
