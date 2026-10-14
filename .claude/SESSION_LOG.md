# softexedge-duplicate session log

## Hero intro: glossy 3D logo that inflates, expands and disappears (2026-10-14)

**Task:** the user's Metalab screen recordings: the hero background is the Metalab mark as a big glossy extruded 3D logo that holds, then inflates like a mylar balloon (puffs, crinkles); the nav/client list fade in as the inflation starts. Do that with our S, but after full expansion it disappears; keep our content where it is. (The first recording named, `20261014-1026-28.6174588.mp4`, is only 0.43 s of the settled page; the motion was read from `20261014-0826-17.6649535.mp4`, 2.5 s.)

**Change.**
- `components/duplicate/DuplicateIntro.tsx` rewritten: was a CSS-only white overlay with the flat logo-mark scaling to 28x; now a fixed full-screen WebGL canvas (raw WebGL1, no library, `z-0`) behind the page. One fragment shader turns a signed distance field of the S into a height field: bevelled slab (0-1 s), then inflates to a round pillow with soft domain-warped noise folds (1-2 s), swelling outward 9 texels, while the mark scales 1 -> 3.6x (ease-in, 1.15-2.75 s), then fades out (2.55-3.0 s) and the canvas unmounts. Lit as glossy plastic (narrow softbox env bands + fresnel), brand gradient #3B3FE6 -> #00E5F0 kept deep, soft contact shadow on the white page. DPR capped at 1.5. Clock = the `.dup-reveal` CSS animation's `startTime`, so the inflation lines up with the content reveal however late JS hydrates; a late first frame fades in over 350 ms instead of popping; arriving after 2.55 s draws nothing. No WebGL / image error / reduced motion = no logo, content unaffected.
- NEW `public/assets/logo-mark-sdf.png` (512x512, 141 KB): SDF of the S, +/-64 texels, 16-bit packed as R + G/255 (bilinear-safe). NEW `scripts/make-logo-sdf.ts` regenerates it from `logo-mark.webp` (ffmpeg decode, 2x supersampled threshold, Felzenszwalb EDT).
- `globals.css`: intro keyframes (`dup-intro-mark`, `dup-intro-out`, `.dup-intro*`) removed; `.dup-reveal` now `position: relative; z-index: 1; animation: dup-reveal 0.8s ease-out 1s both` (was 1 s at 2.6 s). Header + hero text fade in in place at 1.0-1.8 s.
- `DuplicateHero.tsx`: section `bg-white` removed so the canvas shows through (main is still white).
- Look iterations: ridged noise creases read as brush strokes -> smooth fbm folds; highlight bands widened slightly to reduce torn-paper edges.

**Verification.** tsc 0; biome clean on all changed/new files; `bun run build` OK. Headless Chrome (SwiftShader) on `next start`, seeking the CSS clock: 1440x900, 960x600 and 390x844 frames show slab -> content fading in at unchanged position (h1 top 363 / 246 / 414 px at every frame) -> inflated, creased, expanding past the viewport -> fading out -> canvas removed; CDP profiles cleaned (0 left). Frame rate NOT measured (SwiftShader takes ~0.5 s per frame); look needs a real-GPU check.

**Incident.** Running `next build` while the user's `next dev` (:3000) was up cleared `.next` and corrupted its Turbopack cache ("Failed to restore task data") -> every request 500. Killed that dev server, removed `.next`, rebuilt; restarted dev via launch entry `softexedge-duplicate-dev` on :3500. Never `next build` here while a dev server is running.

Not committed.

## Hero intro redone: box opens on a big 3D logo, then fades (2026-10-14)

**Task:** user rejected the inflating WebGL logo: "first a box opens and then there is big logo ... a box open and a big logo is already there and it slightly fades away"; also remove the border from Get in Touch. (Re-read the 08:26 recording: its first frames show Metalab's dark hero box growing from an inset rectangle to full-bleed, white margins shrinking, the giant 3D star already inside.)

**Change.**
- `DuplicateIntro.tsx` back to a server component, pure CSS: fixed `z-[200]` layer > `.dup-intro-box` (#04031c, `clip-path: inset(22% 16% round 24px)` -> `inset(0)` over 0-1.1 s, cubic-bezier(.76,0,.24,1)) > `next/image` `logo-3d.webp` (priority, `size-[min(125svh,150vw)]`, so big and cropped like Metalab's star). Logo fades 1.5-2.2 s, layer 1.9-2.5 s (then `visibility: hidden`), `.dup-reveal` page fade 2.0-2.8 s (opacity only, no z-index any more). Reduced motion: no intro. The WebGL component, its inflate/expand timeline and the canvas layering are gone.
- NEW `public/assets/logo-3d.webp` (1600 px, 35 KB): the S as a thick extruded 3D object (near-black glossy front face with a lit lip, brand-gradient side walls lit from below-left, depth-darkened), flattened onto #04031c. Rendered offline by `scripts/logo-3d/render.ts` (headless Chrome, `extrude.frag`: oblique extrusion = 70 stacked SDF layers, front-most wins, wall normal from the SDF gradient), 2400 px supersampled -> 1600 lanczos. `scripts/make-logo-sdf.ts` moved to `scripts/logo-3d/make-sdf.ts`; the SDF moved out of `public/` to `scripts/logo-3d/sdf.png` (no longer shipped).
- `DuplicateHero.tsx` back to `bg-white` (identical to HEAD). `page/Header.tsx`: removed `pathname === "/"` from `ctaBorder`, so Get in Touch has no border on the home page.

**Verification.** tsc 0 (render.ts uses node:timers instead of the `Bun` global so the root tsconfig typechecks it); biome: new/changed files clean, Header 2 errors = baseline. On the USER's dev server :3000 (no `next build` while it runs), headless Chrome with every `dup-*` animation paused and seeked: 1440x900 clip inset 22/16% -> 18.7/13.6% @0.4 -> 1.4/1.1% @0.8 -> 0 @1.3; logo opacity 1 -> .62 @1.8 -> .04 @2.1 -> 0; layer hidden @3.0; reveal 0 -> .2 @2.1 -> .68 @2.4 -> 1; h1 top 363 at every frame; Get in Touch border 0 px; logo image decoded (1124 px candidate). 390x844 same sequence, h1 414, 585 px candidate. Screenshots reviewed; CDP profiles 0.

Not committed.

## Intro uses the plain logo image; self-made 3D logo removed (2026-10-14)

**Task:** "remove the 3d logo you made yourself just keep the simple image".

**Change.** `DuplicateIntro.tsx` shows `public/assets/logo-mark.webp` (768 px, `unoptimized`, priority) at the same size and in the same box-open/fade sequence. Box colour `#04031c` -> `#03024b`, the badge navy sampled from logo-mark.webp (3, 2, 75), so the badge's rounded corners vanish and only the S reads. Deleted `public/assets/logo-3d.webp` and the whole `scripts/` folder (SDF + render tooling existed only for the 3D logo). Comments, README and workspace map updated. Rule for next time (map): use the real logo image; don't generate logo art.

**Verification.** tsc 0; biome clean on changed files. User's dev server :3000, headless Chrome, animations paused+seeked at 1440x900: clip 22/16% -> 7.3/5.3% @0.6 -> 0 @1.3; logo opacity .38 @1.9 -> 0; layer hidden @3.0; reveal 1; h1 363 throughout; logo decoded at 768 px; CTA border 0 px. Screenshots reviewed: no visible badge edge on the box. No refs to logo-3d / 04031c / sdf left in src or README. CDP profiles 0.

Not committed.

## Intro: small centred logo, then a box opens revealing the header + hero (2026-10-14)

**Task:** "scale down the logo and center it and when the box opens it should reveal the header and the center content".

**Change.**
- `DuplicateIntro.tsx`: one fixed `z-0` navy layer (`.dup-intro`, #03024b), grid-centred `logo-mark.webp` at `size-28 md:size-36` (112/144 px, was min(125svh,150vw)); still `unoptimized`, because the optimizer's re-encode shifted the badge navy enough to show a faint square on mobile (measured: source gives badge = page = rgb(4,2,75)).
- `globals.css`: the box is now the PAGE. `.dup-reveal` (header + hero + rest) is `position: relative; z-index: 1` over the navy layer and animates `clip-path: inset(50vh 50% calc(100% - 50vh) round 24px)` (zero size at screen centre) -> `inset(0 0 calc(100% - 100vh) round 0)` over 0.8-1.9 s, cubic-bezier(.76,0,.24,1), fill `backwards` only so no clip remains afterwards. The clip also clips the fixed navbar, so the header appears when the box reaches the top. Logo fades 0.7-1.1 s; navy layer `visibility: hidden` at 1.9 s. Old box/opacity reveal keyframes removed. First try opened from the logo's footprint, but then the clipped page showed through on top of the logo before the box moved; starting at zero size fixed that.
- `page.tsx`: comment on the wrapper updated.

**Verification.** tsc 0; biome clean. User's dev server :3000, headless Chrome, animations paused+seeked. 1440x900: clip inset(450px 50% ...) at 0 and 0.8 (nothing of the page visible, logo 144 px centred) -> 420/46.7% @1.1 -> 225px/25% @1.35 -> 30px/3.3% @1.6 (header visible) -> clip none @2.0, navy layer hidden; h1 363 throughout; Get in Touch border 0. 390x844: same, logo 112 px, h1 414. Screenshots reviewed. CDP profiles 0.

Not committed.

## Intro box opening measured from the Metalab recording (2026-10-14)

**Task:** "observe the video closely and see how the animation starts, replicate that" (recording `20261014-1116-25.3291253.mp4`, 1906x866, 55 frames @30fps). Everything else unchanged.

**Measured.** Per-frame box edges (dark run on the centre row/column): the box first appears as a tall narrow centred card, 14.9% x 81.5% of the screen, ~12-14 px corners; it grows to full screen in ~0.9 s, width and height on the same curve (remaining inset fraction equal at every frame). Least-squares cubic-bezier fit over 28 frames: `cubic-bezier(0.35, 0.25, 0.25, 1)`, 0.95 s, the recording's frame 0 being ~0.03 s into the motion.

**Change (globals.css only).** `.dup-reveal` clip now starts at `inset(9.5vh 43% calc(100% - 90.5vh) round 14px)` (was a zero-size point) and opens over 0.95 s on the fitted curve, from 0.85 s. New `dup-hold-hidden` keeps the page `visibility: hidden` for 0-0.85 s so the start card never shows over the logo (the clip's `backwards` fill would otherwise show it from t=0). Logo fade moved to 0.5-0.85 s so the card appears just as it has gone; navy layer hidden at 1.8 s (was 1.9).

**Verification.** biome clean. User's dev server :3000, headless Chrome, animations paused+seeked at 1440x900: page hidden 0.3/0.7 s with the logo centred; at 0.85 s card 14% x 81% (inset 85.5px / 43%); width 23% @+0.1 s, 39% @+0.2, 59% @+0.3, 81% @+0.45, 95% @+0.65 vs the recording's 22-26 / 38-43 / 63 / 80-85 / 95.5%; clip none and navy layer hidden at 1.85 s; h1 363 throughout; Get in Touch border 0. Screenshots reviewed. CDP profiles 0.

Not committed.

## Intro: box opens on blank white, logo is the content's background (2026-10-14)

**Task:** "the animation starts in a white blank bg where a rectangle opens revealing the content and the logo is on the bg of the content" (as in the Metalab recording).

**Change.**
- Deleted `DuplicateIntro.tsx` (the navy full-screen layer + small logo); `page.tsx` no longer renders it. Outside the box is now just the page's white.
- `DuplicateHero.tsx`: `logo-mark.webp` (as-is, `unoptimized`, priority) absolutely centred behind the headline at `size-[95svh]` (h1 made `relative` to stay above it). 95svh so the starting card (81% tall) sits wholly on the badge navy and reads as a dark card opening on white, like Metalab's star-filled card. No transparent S exists in the assets (logo.png / logoBlue.png / logo-mark.webp all carry the navy badge), so the badge is used as-is rather than keyed out.
- `globals.css` intro block: page `visibility: hidden` 0-0.3 s (blank white), then the measured card (`inset(9.5vh 43% calc(100% - 90.5vh) round 14px)`, 0.95 s, cubic-bezier(.35,.25,.25,1)) opens to full screen by 1.25 s; `.dup-hero-logo` fades 1.6-2.4 s ("slightly fades away" from the earlier brief). `.dup-intro*`, `dup-intro-out` and the #03024b layer removed; `.dup-reveal` no longer needs position/z-index. Reduced motion: no clip, logo `display: none` (it would otherwise sit behind the headline for good).

**Verification.** tsc 0; biome clean. User's dev server :3000, headless Chrome. Real load (rAF probe from document start): `.dup-reveal` hidden at first frame, then visible with the clip already opening, clip none by ~2 s. Paused+seeked 1440x900: card 14% x 81% on the badge navy, 30% @0.45, 59% @0.6, 86% @0.8, open @1.3; logo box 855 px centred; logo opacity 1 -> .5 @2.0 -> 0 @2.6; h1 363 throughout; Get in Touch border 0. 390x844: logo 802 px (wider than the screen, so the fully open box is navy with the S until it fades), h1 414. Screenshots reviewed; CDP profiles 0. (Seek harness can't show the 0.3 s blank hold: that animation has finished, and left getAnimations(), before the seek.)

Not committed.

## Logo expand-to-cover tried and reverted (2026-10-14)

**Task:** user: "it expands covering the whole screen and then disappears" -> I made the logo behind the headline scale 1 -> 3 until its navy covered the screen, then fade. User stopped the verification and asked "make it like before, before the logo was on the bg".

**Change.** Reverted to the previous state: `.dup-hero-logo` stays in place behind the headline and fades 1.6-2.4 s (`dup-fade-out`), no scaling. Kept from the reverted edit: `overflow-clip` on the hero section, because the 95svh logo is wider than a phone and was making the page scroll sideways.

**Verification.** tsc 0; biome clean. User's dev server :3000, headless Chrome (paused+seeked): logo scale none, opacity 1 @1.3 -> .5 @2.0 -> 0 @2.6, horizontal overflow 0 at 390x844 and 1440x900, h1 414 / 363. CDP profiles 0.

Not committed.

## Restored the measured-opening intro ("like three four tasks before") (2026-10-14)

**Task:** user: go back to the version from three or four tasks ago, i.e. before "white blank bg / logo on the content's bg".

**Change.** Restored the "Intro box opening measured from the Metalab recording" state exactly: `DuplicateIntro.tsx` re-created (fixed z-0 #03024b layer, centred `logo-mark.webp` 112/144 px, unoptimized) and rendered again from `page.tsx`; `globals.css` intro block back to that version (logo fades 0.5-0.85 s, page hidden until 0.85 s, then the 14% x 81% card opens to full screen over 0.95 s on cubic-bezier(.35,.25,.25,1), navy layer hidden at 1.8 s); `DuplicateHero.tsx` restored from git (no logo behind the headline, no overflow-clip). Get in Touch border change kept.

**Verification.** tsc 0; biome clean. User's dev server :3000, paused+seeked at 1440x900: logo on navy with page hidden @0.3; card 14% x 81% @0.85; 39% @1.05, 81% @1.3; clip none and navy layer hidden @1.85; h1 363; CTA border 0. Screenshots reviewed; CDP profiles 0.

Not committed.

## Portfolio replaced by "Our Services" stacking cards (2026-10-14)

**Task:** "remove Portfolio and add Our Services but in stack cards on scroll style".

**Change.**
- NEW `components/duplicate/DuplicateServices.tsx` (server component, `#services`): eyebrow "Services", "Our Services" heading (gradient on Services) and the lede, both from softexedge-sept-2026's home `ServiceSection`; the same 8 services in that order with their `/…` hrefs. Images are the local ones the navbar's Services dropdown uses (dm8, ai9, web7, app, saas3, ui, ui2, video5). No per-service descriptions exist in the source, so none were invented. Cards reuse the existing `.dup-stack` / `.dup-stack-card` / `.dup-stack-card-inner` CSS unchanged (sticky stack, 1.25rem peek, cards underneath shrink): dark `#0a0a0a` rounded card, left "01 / 08" + title + gradient "Explore" pill, right a rounded image panel (md+: 50/50; phone: image on top). Image in a panel, not full-bleed, because the sources are 720-1200 px wide. Whole card is one link (sr-only "Explore <title>").
- `page.tsx` renders `DuplicateServices` where `DuplicatePortfolio` was. Deleted `DuplicatePortfolio.tsx`, `src/data/portfolio.ts` and `ui/DesktopAutoplayVideo.tsx` (no users left); stale mentions in `DuplicateVideoSection` and the globals.css stack comment updated.
- Service links 404 here (those routes only exist in sept-2026), same as the nav.

**Verification.** tsc 0; biome lint + format clean on changed files. User's dev server :3000, headless Chrome, after the intro, scrolled through the list: 1440x900 card 712 px; cards pin at 24/44/64/…/164 one by one, scales 0.72…0.967 under the 8th (1 - (n-1-i)*0.04), 8/8 images loaded, horizontal overflow 0. 390x844: pins 12/32/…/164, same scales, overflow 0. Screenshots reviewed. CDP profiles 0.

Not committed.

## Service cards redesigned after the user's reference, in brand tone (2026-10-14)

**Task:** "design the cards like this but with our brands tone" (reference: off-white card, big pink "02", huge heavy black "Marketing & content." with a full stop, one bold line under it).

**Change (`DuplicateServices.tsx` only).** Type-only card: cool off-white `#F4F6FB` (brand blue-white instead of the reference's warm beige), hairline `ring-[#03024B]/8` + an upward navy-tinted shadow so each light card reads over the light card under it; number in the brand gradient (#2E5BFF -> #149CCB), `font-black`, 48/72/88 px; title Satoshi `font-black` with a trailing full stop, 44 px phone -> 136 px lg, `text-balance`; one bold line under it. Lines are softexedge-sept-2026's own meta descriptions for each service page (no copy invented). Gradient arrow circle top-right (rotates 45 deg on hover; the whole card stays one link). Photo panel removed (the reference is type-only); the images stay in public/ unused by this section. Stack CSS untouched.

**Verification.** tsc 0; biome check clean (imports re-ordered by biome). User's dev server :3000 (computed styles confirmed the new arbitrary classes compiled: bg rgb(244,246,251), number background-image linear-gradient(#2E5BFF…), h3 136 px / 900 at 1440, 44 px at 390). Stack: pins 24/44/…/124, scales 0.72…0.896 at 1440; phone 12/32/64; overflow 0. Screenshots reviewed. CDP profiles 0.

Not committed.

## Service cards black (2026-10-14)

**Task:** "now make the cards bg black".

**Change (`DuplicateServices.tsx`).** Card `bg-[#F4F6FB] text-[#0B0B0F]` -> `bg-black text-white`; hairline `ring-white/10`, upward shadow now plain black (rgba 0,0,0,.5); focus outline white. Gradient number and arrow unchanged. Comments updated.

**Verification.** tsc 0; biome check clean. User's dev server :3000: computed card bg rgb(0,0,0), h3 rgb(255,255,255), number still the brand gradient; stack pins 24/44/… with scales 0.72/0.895 at 1440, 12/32/64 at 390; overflow 0. Screenshot reviewed. CDP profiles 0.

Not committed.

## Hero title bigger; hero / showreel / services refined with taste-skill + awesome-design-md (2026-10-14)

**Task:** "in herosection make the title slightly big, and use awesome-design-md and taste skill to refine these three components".

**Design read (taste-skill):** agency landing for business buyers, bold editorial black/white with one blue accent; redesign-preserve (structure, copy, motion kept). Reference spec from awesome-design-md: `vercel` (stark ink on near-white, near-black ink instead of pure black, hairline edges, soft stacked shadows, aggressive negative display tracking), mapped onto our Satoshi + brand gradient; Vercel's own fonts/colours not used.

**Change.**
- Hero (`DuplicateHero.tsx`): h1 40/60/72/96 -> 44/64/84/112 px (`text-[2.75rem] sm:text-[4rem] md:text-[5.25rem] lg:text-[7rem]`), ink `#0A0A0A` (no pure black), tracking -0.035em -> -0.04em, leading .92 -> .9. Still 3 lines at 390 and 1440.
- Showreel (`DuplicateVideoSection.tsx`): play/pause was a bare icon (could vanish on bright frames) -> `bg-black/40` + `ring-white/25`, 64 -> 80 px at md, hover darkens, `active:scale-[0.96]`; deliberately no backdrop-blur (re-blurs every frame over playing video). Removed the top black scrim (it served a label that no longer exists). Card base `#0A0A0A`.
- Services (`DuplicateServices.tsx`): dropped the "Services" eyebrow (repeated the "Our Services" heading; eyebrow restraint), card `bg-black` -> `#0A0A0A`, hairline `ring-white/[0.08]`, tagline `text-white/75` so the title leads (hierarchy by colour, not size), arrow `group-active:scale-[0.96]`.
- `page.tsx` meta description: em-dash -> colon (taste-skill em-dash ban).
- Not applied, on purpose: split/asymmetric hero (the centred manifesto hero is the user's design), adding hero subtext/CTA (content change), dark mode (page is light-locked by design), swapping lucide (already a project dependency).

**Verification.** tsc 0; biome lint clean; format: Hero diff is CRLF-only (LF copy formats clean), VideoSection has the same 1 format complaint as HEAD. User's dev server :3000, headless Chrome: 1440x900 h1 112 px, 3 lines, rgb(10,10,10); 390x844 h1 44 px, 3 lines; showreel button bg rgba(0,0,0,.4) 80 px (64 on phone); services eyebrows 0, card bg rgb(10,10,10), tagline white/.75; overflow 0. No em/en-dashes left in the duplicate components or page.tsx. Screenshots reviewed. CDP profiles 0.

Not committed.

## Services eyebrow restored; card content scaled down, equal larger vertical padding (2026-10-14)

**Task:** "why did you remove the eyebrow add it again and in the service cards scale down the inside content and increase the padding bottom and top same". (The eyebrow was removed in the previous refine pass on the taste-skill "eyebrow restraint" rule; the user did not want that.)

**Change (`DuplicateServices.tsx`).** "Services" eyebrow restored with its exact previous markup. Card padding `p-6 md:p-12 lg:p-16` -> `px-6 py-10 md:px-12 md:py-16 lg:px-16 lg:py-24` (top = bottom, larger; sides unchanged). Content scaled ~75%: number 48/72/88 -> 36/48/60 px, title 44/60/96/136 -> 36/48/72/104 px, line 18/24/28 -> 16/20/22 px, arrow circle 48/64 -> 40/56 px (icon 24/32 -> 20/28).

**Verification.** tsc 0; biome check clean. User's dev server :3000: eyebrow "Services" present; 1440: padding 96/96 top/bottom, 64 sides, number 60, h3 104, line 22, arrow 56; 390: padding 40/40, 24 sides, number 36, h3 36, line 16, arrow 40; overflow 0. Screenshots reviewed. CDP profiles 0.

Not committed.

## Pushed to main (2026-10-14)

User asked to push. `git fetch`: main == origin/main (0/0). One commit `15dd039` "feat: Metalab-style intro, Our Services stacking cards, hero polish" (12 files: intro, services stack, hero/showreel/header tweaks, deletions of DuplicatePortfolio / data/portfolio / DesktopAutoplayVideo, README, this log). Verified with a clean production build of that commit in a temporary git worktree (fresh `bun install --frozen-lockfile`, `bun run build` exit 0, `/` static), so the user's running dev server's `.next` was not touched; worktree removed. Pushed 769b857..15dd039 to origin/main.

## Intro: white -> full-height centre line opens to cover the whole screen, logo backdrop then fades (2026-10-14)

**Task (two messages):** "first a white blank background, a vertical line appears in the center and it opens/expands on the whole viewport revealing the content inside (header and main title), behind the title the big logo, after the animation is complete it disappears"; then, angrily: "the line opens up means it covers the full width and height".

**What went wrong first.** The first take (not seen by me, the user watched it on :3000) drew an 81%-tall line and put only the 95svh logo square behind the title, so the dark area the line opened stopped at the logo square's edges instead of filling the screen.

**Change.** Deleted `DuplicateIntro.tsx` (navy layer + small logo) and its use in `page.tsx`. `DuplicateHero.tsx`: full-bleed `#03024b` backdrop (`.dup-hero-logo`, absolute inset-0) with `logo-mark.webp` at 95svh centred inside, h1 `relative` above it, section `overflow-clip`. `globals.css`: page hidden 0-0.3 s (blank white); `.dup-reveal` clip: point -> full-height 2px centre line (0.3-0.75 s, ease-out) -> hold -> opens sideways to the full viewport (0.9-1.85 s, measured Metalab curve cubic-bezier(.35,.25,.25,1)); backdrop fades 2.0-2.7 s. Reduced motion: no clip, backdrop hidden. README updated.

**Verification.** tsc 0; biome lint clean. User's dev server :3000, paused+seeked at 1440x900: 0.8 s clip `inset(0 calc(50% - 1px) calc(100% - 900px))` = full-height line; 1.35 s line opened to 78% width, full height; 1.9 s clip none, navy backdrop (1425 px wide, full screen) with the logo behind the title and header; h1 343; overflow 0. Screenshots reviewed. CDP profiles 0.

Not committed.

## Hero title white during the intro, back to black when it finishes (2026-10-14)

**Task:** "first the black title will be white and when the animation finishes it turns black again".

**Change.** `DuplicateHero.tsx`: h1 gets `dup-hero-title`. `globals.css`: `@keyframes dup-title-ink { from { color: #fff } }` on `.dup-hero-title`, 0.7 s ease-in-out at 2 s `both`, i.e. white until the backdrop starts fading and back to its own `#0A0A0A` in lockstep with `.dup-hero-logo`. The gradient word is background-clipped so it is unaffected. Reduced motion: no animation (black, backdrop hidden).

**Verification.** tsc 0; biome lint clean. User's dev server :3000, paused+seeked 1440x900: h1 color rgb(255,255,255) @1.9 s (navy backdrop) -> rgb(133,133,133) @2.35 (backdrop .5) -> rgb(10,10,10) @2.8 (backdrop gone). Screenshots reviewed. CDP profiles 0.

Not committed.
