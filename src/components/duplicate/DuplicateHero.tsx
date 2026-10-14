"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

const WORDS = ["Businesses", "Brands", "Products", "Platforms"] as const;
const ROTATE_MS = 2600;

const GRADIENT =
  "bg-linear-to-r from-[#2E5BFF] to-[#149CCB] bg-clip-text text-transparent";

/**
 * /duplicate hero: white canvas, a three-line headline, and the last line's
 * word cycling in the brand gradient. During the intro the whole hero sits
 * on a full-bleed navy backdrop with the SoftexEdge mark large in the middle
 * (`.dup-hero-logo`), so the opening line (`.dup-reveal` in globals.css)
 * reveals navy edge to edge; once fully open the backdrop fades away.
 */
export default function DuplicateHero() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // Reduced motion: the first word stays put rather than swapping on a timer.
    if (reduce) return;
    const timer = setInterval(
      () => setIndex((i) => (i + 1) % WORDS.length),
      ROTATE_MS,
    );
    return () => clearInterval(timer);
  }, [reduce]);

  return (
    // overflow-clip: the logo behind the headline is wider than a phone; it
    // must never widen the page.
    <section className="relative flex min-h-[100svh] w-full items-center justify-center overflow-clip bg-white px-4 pt-40 pb-16 md:px-8">
      {/* #03024b is the badge navy of logo-mark.webp, so the badge's edges
          vanish into the backdrop and only the S reads. */}
      <div
        aria-hidden="true"
        className="dup-hero-logo pointer-events-none absolute inset-0 grid place-items-center bg-[#03024b]"
      >
        <Image
          src="/assets/logo-mark.webp"
          alt=""
          width={768}
          height={768}
          priority
          // The source keeps the badge navy exact and is sharper at this size
          // than an optimizer candidate.
          unoptimized
          className="size-[95svh] max-w-none"
        />
      </div>
      <h1 className="dup-hero-title relative text-center font-black uppercase leading-[0.9] tracking-[-0.04em] text-[#0A0A0A] text-[2.75rem] sm:text-[4rem] md:text-[5.25rem] lg:text-[7rem]">
        {/* One stable sentence for assistive tech; the visual lines below
            change every few seconds and would otherwise be re-announced. */}
        <span className="sr-only">
          We build digital businesses, brands, products and platforms
        </span>
        <span aria-hidden="true" className="block">
          We Build
        </span>
        <span aria-hidden="true" className="block">
          Digital
        </span>
        <span aria-hidden="true" className="block">
          {/* Every word sits invisibly in the same grid cell, so the line is
              always as wide as the longest one: swapping words never shifts
              the layout or re-centres the line. */}
          <span className="inline-grid overflow-hidden pb-[0.06em] align-bottom">
            {WORDS.map((word) => (
              <span
                key={word}
                className="invisible col-start-1 row-start-1 whitespace-nowrap"
              >
                {word}
              </span>
            ))}
            {/* Not mode="wait": the outgoing word rolls up and out while the
                next rolls in from below, in the same clipped cell, so the
                line is never empty between words. */}
            <AnimatePresence initial={false}>
              <motion.span
                key={WORDS[index]}
                initial={{ opacity: 0, y: "100%" }}
                animate={{ opacity: 1, y: "0%" }}
                exit={{ opacity: 0, y: "-100%" }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="col-start-1 row-start-1 whitespace-nowrap"
              >
                {/* The gradient lives on a static child, never on the moving
                    element: a background-clipped element re-rasterises every
                    frame if it is the one being transformed. */}
                <span className={GRADIENT}>{WORDS[index]}</span>
              </motion.span>
            </AnimatePresence>
          </span>
        </span>
      </h1>
    </section>
  );
}
