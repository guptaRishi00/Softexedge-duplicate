"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

const WORDS = ["Businesses", "Brands", "Products", "Platforms"] as const;
const ROTATE_MS = 2600;

const GRADIENT =
  "bg-linear-to-r from-[#2E5BFF] to-[#149CCB] bg-clip-text text-transparent";

/**
 * /duplicate hero: white canvas, a three-line headline, and the last line's
 * word cycling in the brand gradient. No video, no image.
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
    <section className="relative flex min-h-[100svh] w-full items-center justify-center bg-white px-4 pt-40 pb-16 md:px-8">
      <h1 className="text-center font-black uppercase leading-[0.92] tracking-[-0.035em] text-black text-[2.5rem] sm:text-6xl md:text-7xl lg:text-[6rem]">
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
