# softexedge-duplicate

The SoftexEdge "duplicate" page (logo intro, rotating-word hero, scroll-grown
showreel, "Our Services" stacking cards), moved out of `softexedge-sept-2026`'s
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
- Hero intro: pure CSS in `globals.css` (`.dup-reveal` clip + `.dup-hero-logo`
  in `DuplicateHero.tsx`, showing `public/assets/logo-mark.webp`).
- Don't run `bun run build` while `bun run dev` is running: the build clears
  `.next` and corrupts the dev server's Turbopack cache.
- The header's nav links and the service cards' links point at
  routes that exist only in `softexedge-sept-2026`, so they 404 here.
