# softexedge-duplicate

The SoftexEdge "duplicate" page (logo intro, rotating-word hero, scroll-grown
showreel, stacking portfolio cards), moved out of `softexedge-sept-2026`'s
`/duplicate` route on 2026-10-14. Here it is the home page, `src/app/page.tsx`.

Stack matches the original: Next.js 16.2.5 (App Router, React Compiler),
React 19.2.4, Tailwind v4 (CSS-first, `src/app/globals.css`), Biome, Bun.
`public/` is a full copy of the original project's assets.

```bash
bun install
bun run dev -- -p 3500
```

- Build: `bun run build` · Typecheck: `bunx tsc --noEmit` · Lint: `bun run lint`
- Next 16 differs from older versions: read `node_modules/next/dist/docs/`
  before writing Next code (see `AGENTS.md`).
- The header's nav links and the portfolio cards' `/work/*` links point at
  routes that exist only in `softexedge-sept-2026`, so they 404 here.
