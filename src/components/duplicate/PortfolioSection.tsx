"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { useIsDesktop } from "@/lib/useIsDesktop";
import { portfolioProjects as projects } from "@/data/portfolio";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const AUTO_ADVANCE_SECONDS = 6;
// Mobile carousel: one slide every 4.5s, each slide taking 600ms, and autoplay
// resuming 1.5s after the finger lifts.
const MOBILE_AUTOPLAY_MS = 5000;
// The title slide holds longer than the case studies — it is the one panel the
// reader is meant to actually read before the carousel starts moving.
const MOBILE_FIRST_SLIDE_MS = 10000;
const MOBILE_RESUME_MS = 1500;
const MOBILE_SLIDE_MS = 600;
// A held pointer expires after this, so a missing pointerup can never stall it.
const MOBILE_STUCK_POINTER_MS = 5000;


export default function PortfolioSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  // Mobile slide surface: the autoplay transition translates this inner
  // wrapper on the compositor, then commits the distance to scrollLeft.
  const panelsRef = useRef<HTMLDivElement>(null);
  const isDesktop = useIsDesktop();

  // Owns panel-video playback outright: they start here, not from `autoPlay`.
  //
  // The initial decision is a SYNCHRONOUS on-screen check — the same idiom the
  // carousel autoplay below already uses — rather than the observer's first
  // callback. That ordering is the fix. These panels are offscreen at mount,
  // so the observer's one and only callback fired "not intersecting" while
  // `pause()` was still a no-op on a video that had not started yet; `autoPlay`
  // then started it, the panel never intersected again, and no second callback
  // ever came. The result was a 951KB video decoding for the entire visit
  // behind a panel four slides to the right.
  //
  // A video that IS on screen at mount still plays immediately and is only ever
  // stopped by an explicit "not intersecting", so the fail-open behaviour that
  // keeps a visible panel from sticking on a black frame is unchanged.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const videos = Array.from(container.querySelectorAll("video"));
    if (videos.length === 0) return;

    const onScreen = (el: Element) => {
      const r = el.getBoundingClientRect();
      return (
        r.bottom > 0 &&
        r.top < window.innerHeight &&
        r.right > 0 &&
        r.left < window.innerWidth
      );
    };
    for (const v of videos) {
      if (onScreen(v)) v.play().catch(() => {});
    }

    if (typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const v = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) v.play().catch(() => {});
          else v.pause();
        }
      },
      { rootMargin: "100px" },
    );
    for (const v of videos) io.observe(v);
    return () => io.disconnect();
  }, []);

  // Mobile autoplay. Dragging is NOT implemented in JS: below `md` the track is
  // a native scroll-snap container, so the browser owns the drag, the momentum
  // and the snapping — nothing runs per frame while the user is in control.
  useEffect(() => {
    if (isDesktop) return;
    const track = trackRef.current;
    if (!track) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Every gate below is a synchronous check made at tick time, never a flag
    // set by an async callback. The previous version gated on an
    // IntersectionObserver `visible` flag and a setTimeout-cleared `paused`
    // flag; if either callback failed to arrive — a missed IO delivery, a
    // `pointerdown` whose `pointerup`/`pointercancel` never came — the flag
    // latched and autoplay was dead permanently with no way back.
    let pointerDown = false;
    let lastInteraction = 0;
    // When the current slide settled. The interval still fires every
    // MOBILE_AUTOPLAY_MS; this is what lets slide 0 sit for two ticks while
    // every other slide advances on the first.
    let lastAdvance = performance.now();

    const panels = panelsRef.current;
    if (!panels) return;

    let sliding = false;
    let slideTimer = 0;

    // The slide runs as a CSS transform transition on the panels wrapper, not
    // as per-frame scrollLeft writes. scrollLeft can only be driven from the
    // main thread, so the old rAF tween stuttered whenever anything else ran
    // during its 600ms window; a transform transition is composited and cannot
    // be blocked by script. When it finishes (or is interrupted), the visual
    // offset is committed to scrollLeft in the same style flush that clears
    // the transform — the swap is invisible. `behavior: "smooth"` remains off
    // the table: it is ignored outright in some mobile browsers and fights
    // `scroll-snap-type: mandatory` in others.
    // On completion the intent is known — commit the slide's own distance
    // rather than a measured matrix, so a throttled or coalesced transition
    // (background tab, busy compositor) still lands exactly one page. Only an
    // INTERRUPTION needs to measure where the transition actually got to.
    const commit = (px: number) => {
      panels.style.transition = "none";
      panels.style.transform = "";
      panels.style.willChange = "";
      if (px) track.scrollLeft += px;
      // flush so the cleared transition cannot animate the reset
      void panels.offsetWidth;
      panels.style.transition = "";
    };

    let slideDistance = 0;

    const animateTo = (to: number) => {
      const distance = to - track.scrollLeft;
      if (Math.abs(distance) < 1) return;
      slideDistance = distance;

      const snapBefore = track.style.scrollSnapType;
      track.style.scrollSnapType = "none";
      sliding = true;
      panels.style.willChange = "transform";
      panels.style.transition = `transform ${MOBILE_SLIDE_MS}ms cubic-bezier(0.65, 0, 0.35, 1)`;
      panels.style.transform = `translate3d(${-distance}px, 0, 0)`;

      // setTimeout, not transitionend: the timer fires even if the event is
      // lost, so a missed transition can never wedge `sliding` shut.
      slideTimer = window.setTimeout(() => {
        sliding = false;
        commit(slideDistance);
        track.style.scrollSnapType = snapBefore;
      }, MOBILE_SLIDE_MS + 60);
    };

    const stopTween = () => {
      if (!sliding) return;
      window.clearTimeout(slideTimer);
      sliding = false;
      // interrupted mid-flight: commit however far the transition got
      const m = new DOMMatrixReadOnly(getComputedStyle(panels).transform).m41;
      commit(-m);
      track.style.scrollSnapType = "";
    };

    // Measured fresh each tick rather than tracked by an observer, so it can
    // never be stale. One layout read every 4.5s is nothing.
    const isOnScreen = () => {
      const rect = track.getBoundingClientRect();
      return rect.bottom > 0 && rect.top < window.innerHeight;
    };

    const advance = () => {
      const now = performance.now();
      if (sliding) return;
      // A pointerdown whose up/cancel never arrived must not stall autoplay
      // for good, so the held state expires on its own.
      if (pointerDown && now - lastInteraction < MOBILE_STUCK_POINTER_MS)
        return;
      if (now - lastInteraction < MOBILE_RESUME_MS) {
        // Restart the dwell once the reader stops interfering, rather than
        // firing the moment the resume window lapses.
        lastAdvance = now;
        return;
      }
      if (!isOnScreen()) {
        // Same for scrolling past: the slide gets its full hold from the
        // moment it is actually on screen.
        lastAdvance = now;
        return;
      }

      const page = track.clientWidth;
      // Index read from scrollLeft at tick time — synchronous, so it cannot go
      // stale the way a tracked counter would after a drag or a dot tap.
      const index = page > 0 ? Math.round(track.scrollLeft / page) : 0;
      const hold = index === 0 ? MOBILE_FIRST_SLIDE_MS : MOBILE_AUTOPLAY_MS;
      // 50ms tolerance: setInterval drifts, and an elapsed of 9998 against a
      // 10000 hold would otherwise cost a whole extra tick.
      if (now - lastAdvance < hold - 50) return;

      lastAdvance = now;
      const atEnd = track.scrollLeft >= track.scrollWidth - page - 1;
      animateTo(atEnd ? 0 : track.scrollLeft + page);
    };
    const tick = setInterval(advance, MOBILE_AUTOPLAY_MS);

    // Pause only while the finger is actually down, plus a short settle — NOT
    // for a fixed spell after any touch. The previous version paused for
    // seconds on every `touchstart`, including the incidental touches of
    // scrolling the PAGE past the carousel, so on a phone it could sit still
    // for ~10s after each swipe and looked like it never moved at all.
    const hold = () => {
      stopTween();
      pointerDown = true;
      lastInteraction = performance.now();
    };
    const release = () => {
      pointerDown = false;
      lastInteraction = performance.now();
    };
    // wheel has no matching "up", so hold+release act as a debounce there
    const holdEvents = ["pointerdown", "wheel"] as const;
    const releaseEvents = ["pointerup", "pointercancel", "wheel"] as const;
    for (const evt of holdEvents) {
      track.addEventListener(evt, hold, { passive: true });
    }
    for (const evt of releaseEvents) {
      track.addEventListener(evt, release, { passive: true });
    }

    return () => {
      clearInterval(tick);
      stopTween();
      for (const evt of holdEvents) track.removeEventListener(evt, hold);
      for (const evt of releaseEvents) track.removeEventListener(evt, release);
    };
  }, [isDesktop]);

  const { contextSafe } = useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px)", () => {
        let moveCursor: (e: MouseEvent) => void = () => {};
        const cursor = cursorRef.current;

        if (cursor) {
          gsap.set(cursor, {
            scale: 0,
            autoAlpha: 0,
            xPercent: -50,
            yPercent: -50,
          });

          const xTo = gsap.quickTo(cursor, "x", {
            duration: 0.15,
            ease: "power3",
            force3D: true,
          });
          const yTo = gsap.quickTo(cursor, "y", {
            duration: 0.15,
            ease: "power3",
            force3D: true,
          });

          moveCursor = (e: MouseEvent) => {
            xTo(e.clientX);
            yTo(e.clientY);
          };

          window.addEventListener("mousemove", moveCursor);
        }

        let cleanupAuto: () => void = () => {};
        const track = trackRef.current;
        if (track) {
          // Count panels from the DOM: the "Our Projects" title slide is a
          // panel with no projects[] entry, so projects.length undercounts.
          // querySelectorAll, not children.length — the panels sit inside the
          // mobile slide wrapper (display:contents on md, but still one child).
          const panelCount = track.querySelectorAll(".project-panel").length;
          const totalWidth = track.scrollWidth - window.innerWidth;
          const holdPx = window.innerHeight;
          const xPhase = totalWidth / (totalWidth + holdPx);
          const scrollTween = gsap
            .timeline({
              scrollTrigger: {
                trigger: containerRef.current,
                start: "top top",
                end: () => `+=${totalWidth + holdPx}`,
                pin: true,
                scrub: 1,
                anticipatePin: 1,
                invalidateOnRefresh: true,
                snap: {
                  snapTo: (value) => {
                    if (value >= xPhase) return value;
                    const steps = panelCount - 1;
                    return (
                      (Math.round((value / xPhase) * steps) / steps) * xPhase
                    );
                  },
                  duration: { min: 0.15, max: 0.4 },
                  delay: 0.08,
                  ease: "power1.inOut",
                },
              },
            })
            .to(track, {
              x: () => -totalWidth,
              ease: "none",
              force3D: true,
              duration: totalWidth,
            })
            .to({}, { duration: holdPx });

          const st = scrollTween.scrollTrigger;
          let autoTween: gsap.core.Tween | null = null;

          const stopAuto = () => {
            autoTween?.kill();
            autoTween = null;
          };

          const startAuto = () => {
            if (!st || autoTween) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
              return;
            }
            const from = st.scroll();
            const to = st.start + totalWidth;
            if (from >= to) return;

            const proxy = { y: from };
            autoTween = gsap.to(proxy, {
              y: to,
              duration: ((to - from) / totalWidth) * AUTO_ADVANCE_SECONDS,
              ease: "none",
              onUpdate: () => st.scroll(proxy.y),
              onComplete: stopAuto,
            });
          };

          const interrupts = ["wheel", "touchstart", "pointerdown", "keydown"];
          for (const evt of interrupts) {
            window.addEventListener(evt, stopAuto, { passive: true });
          }

          ScrollTrigger.create({
            trigger: containerRef.current,
            start: "top top",
            end: () => `+=${totalWidth + holdPx}`,
            onEnter: startAuto,
            onLeave: stopAuto,
            onLeaveBack: stopAuto,
          });

          cleanupAuto = () => {
            stopAuto();
            for (const evt of interrupts) {
              window.removeEventListener(evt, stopAuto);
            }
          };

          gsap.utils
            .toArray<HTMLElement>(".project-panel")
            .forEach((panel, index) => {
              const isFirst = index === 0;
              const content = panel.querySelectorAll(".reveal-item");
              if (!isFirst) {
                gsap.set(content, { y: 60, opacity: 0 });
                gsap.to(content, {
                  y: 0,
                  opacity: 1,
                  duration: 1,
                  stagger: 0.08,
                  ease: "power3.out",
                  scrollTrigger: {
                    trigger: panel,
                    containerAnimation: scrollTween,
                    start: "left 85%",
                    toggleActions: "play none none none",
                  },
                });
              }
            });
        }

        return () => {
          if (moveCursor) {
            window.removeEventListener("mousemove", moveCursor);
          }
          cleanupAuto();
        };
      });
      return () => mm.revert();
    },
    { scope: containerRef },
  );
  const handleMouseEnter = contextSafe(() => {
    gsap.to(cursorRef.current, {
      scale: 1,
      autoAlpha: 1,
      duration: 0.4,
      ease: "back.out(1.5)",
    });
  });

  const handleMouseLeave = contextSafe(() => {
    gsap.to(cursorRef.current, {
      scale: 0,
      autoAlpha: 0,
      duration: 0.3,
      ease: "power3.inOut",
    });
  });

  return (
    <section
      ref={containerRef}
      id="portfolio"
      onMouseLeave={isDesktop ? handleMouseLeave : undefined}
      // No bottom padding below `md`: the section background is #0a0a0a and
      // StatsSection under it is white at pt-0, so any padding here reads as a
      // black band rather than breathing room. The slide image meets the white
      // section directly, as it did before the carousel.
      className="relative h-auto w-full overflow-hidden bg-[#0a0a0a] text-white md:h-screen"
    >
      <div
        ref={trackRef}
        // Both breakpoints lay out in a row now; below `md` this element is
        // itself the scroll container (desktop instead has GSAP translate it).
        className="no-scrollbar flex w-full flex-row max-md:snap-x max-md:snap-mandatory max-md:overflow-x-auto max-md:overscroll-x-contain md:h-full md:w-max"
      >
        {/* Mobile slide surface. `md:contents` erases the box on desktop so
            the GSAP track keeps translating panels directly; below md it is the
            element the autoplay transition transforms. w-full (not w-max):
            panels size against the scroller's width, and their overflow still
            extends the scroller's scrollable range. */}
        <div ref={panelsRef} className="flex w-full flex-row md:contents">
          {/* Title slide — typographic opener before the case studies. It
            carries the same `project-panel` class so the desktop GSAP (snap
            steps and the reveal loop, both keyed on panel order) treats it as
            panel 0 — which the reveal loop already leaves static. Pure text on
            the section's own #0a0a0a: no image to decode, nothing animating. */}
          <div className="project-panel relative isolate flex h-[70svh] w-full shrink-0 flex-col justify-center overflow-hidden p-8 max-md:snap-center max-md:px-3 md:h-screen md:w-screen md:p-16 lg:px-20">
            {/* Backdrop for the title slide, both breakpoints. A static image
                needs none of the viewport gating the animated grid required —
                it has no rAF loop to idle, and next/image handles its own
                loading. `-z-10` is scoped by the panel's own `isolate`, so it
                sits above the section background and behind the copy; without
                that isolation a negative z-index would escape this panel and
                paint behind the section's #0a0a0a. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
            >
              <Image
                src="/assets/collage4.webp"
                alt=""
                fill
                sizes="100vw"
                // Sits under a black->transparent scrim; 65 is indistinguishable
                // from the default 75 there and ~30% smaller.
                quality={65}
                className="object-cover"
              />
              {/* Scrim: the copy is white and left-aligned, so the darkening
                  runs left-to-right — solid black behind the type, clearing to
                  nothing on the right where the collage can read on its own. */}
              <div className="absolute inset-0 bg-linear-to-r from-black to-transparent" />
            </div>

            <p className="relative mb-6 text-sm font-medium uppercase tracking-[0.3em] text-zinc-500 max-md:mb-4 max-md:text-xs">
              Portfolio
            </p>
            <h2 className="relative text-[3.25rem] font-bold leading-[0.9] tracking-[-0.04em] max-md:text-[2.75rem] md:text-8xl lg:text-[9rem]">
              Our{" "}
              {/* `pr-3` is load-bearing, not spacing: `bg-clip-text` paints the
                  gradient only within the element's box, and this h2's
                  `tracking-[-0.04em]` pulls the box in until the final "s"
                  overhangs it by ~2px at the 144px size — that sliver gets no
                  gradient and reads as a cut letter. Same fix the other
                  gradient headings already carry. */}
              <span className="bg-linear-to-r from-[#2E5BFF] to-[#149CCB] bg-clip-text pr-3 text-transparent">
                Projects
              </span>
            </h2>
            <p className="relative mt-8 max-w-xl text-lg font-light leading-[1.25em] text-white max-md:mt-6 max-md:text-base">
              {String(projects.length).padStart(2, "0")} case studies in brand,
              product and growth — scroll to explore
            </p>
          </div>

          {projects.map((project, panelIndex) => (
            <div
              key={project.id}
              // max-md:isolate — on mobile nothing above this panel creates a
              // stacking context (the GSAP transform on the track is md+ only),
              // so the -z-20 image holder escalates to the page wrapper's context
              // and the section's opaque bg-[#0a0a0a] paints OVER it: black
              // panels, no images. isolation scopes the -z-20 to this panel.
              className="project-panel relative flex h-[70svh] w-full shrink-0 flex-col justify-end overflow-hidden p-8 max-md:isolate max-md:snap-center max-md:px-3 max-md:pb-12 md:h-screen md:w-screen md:p-16 lg:px-20 lg:pb-12 lg:pt-20"
            >
              <Link
                href={project.href}
                className="absolute inset-0 z-20 cursor-none max-md:cursor-pointer"
                // Same iOS first-tap-is-a-hover problem as ChannelCard: this
                // cursor pill is `hidden md:flex`, but animating it in during
                // the synthesised hover pass still costs the panel its first
                // tap, so the link needs tapping twice.
                onMouseEnter={isDesktop ? handleMouseEnter : undefined}
                onMouseLeave={isDesktop ? handleMouseLeave : undefined}
              >
                <span className="sr-only">View {project.title}</span>
              </Link>

              <div className="absolute inset-0 -z-20 overflow-hidden">
                {project.type === "video" ? (
                  // No `autoPlay` — the effect above starts it, so a panel
                  // that is offscreen at mount never begins decoding at all.
                  // `preload="none"` follows from that: this panel is four
                  // slides right of the entry point, so its 951KB was being
                  // pulled down on every visit for a background most readers
                  // never scroll to. Playback does not wait for the whole file
                  // either — `play()` starts as soon as enough is buffered.
                  <video
                    muted
                    loop
                    preload="none"
                    playsInline
                    className="h-full w-full object-cover"
                  >
                    <source src={project.video} type="video/mp4" />
                  </video>
                ) : (
                  <Image
                    src={project.image as string}
                    alt={project.title}
                    fill
                    sizes="100vw"
                    // Eager for the FIRST panel only. Eager everywhere meant
                    // all five full-viewport backgrounds were fetched and
                    // decoded during load — four of them for panels sitting
                    // off to the right of a horizontal scroller that the reader
                    // may never reach. On a phone those decodes land in the
                    // same window as first scroll and read as tap latency.
                    // The original "a deferred load leaves the panel black"
                    // note still holds for the panel you can actually see on
                    // arrival, which is exactly the one kept eager.
                    loading={panelIndex === 0 ? "eager" : "lazy"}
                    className="h-full w-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-linear-to-t from-black/100 via-black/20 to-transparent" />
              </div>

              <div className="pointer-events-none relative z-10 flex w-full items-end justify-between">
                <div className="flex w-full flex-col items-start gap-4 max-md:gap-3 md:gap-5 lg:w-[80%]">
                  <p className="reveal-item text-sm font-medium uppercase tracking-[0.3em] text-white max-md:text-xs">
                    {project.category}
                  </p>

                  <h2 className="reveal-item -ml-[0.05em] text-5xl font-bold leading-[0.9] tracking-[-0.05em] max-md:text-[2.125rem] md:text-7xl lg:text-[7rem]">
                    {project.title}
                  </h2>

                  <p className="reveal-item max-w-[95%] text-sm leading-[1.5] text-white/80 max-md:text-sm md:text-lg lg:max-w-[90%]">
                    {project.description}
                  </p>

                  <div className="reveal-item mt-2 flex flex-wrap gap-2 md:gap-3">
                    {project.tech.map((tag, i) => (
                      <span
                        key={i}
                        // No backdrop-filter below md. Every one of these chips
                        // makes the compositor snapshot and blur what is behind it
                        // on EVERY frame, and the panels put ~19 of them inside a
                        // horizontal scroller — the single biggest cost while
                        // swiping. The heavier flat bg keeps them just as legible
                        // over the photo. Desktop keeps the blur.
                        className="rounded-md border border-white/20 bg-black/20 px-4 py-1.5 text-[0.65rem] font-bold uppercase tracking-widest text-white/90 backdrop-blur-md max-md:bg-black/50 max-md:px-3 max-md:py-1 max-md:text-[0.6rem] max-md:backdrop-blur-none md:text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        ref={cursorRef}
        className={cn(
          "pointer-events-none fixed left-0 top-0 z-9999 hidden h-10 w-33 items-center justify-center rounded-lg bg-linear-to-r from-[#2E5BFF] to-[#149CCB] text-white md:flex",
          "invisible opacity-0",
          "will-change-transform",
        )}
      >
        <span className="mt-px ml-1 text-[0.65rem] font-bold uppercase tracking-[0.2em]">
          View Project
        </span>
      </div>
    </section>
  );
}
