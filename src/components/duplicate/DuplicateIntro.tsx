import Image from "next/image";

/**
 * /duplicate page intro: the SoftexEdge mark appears on white, expands past
 * the viewport while fading, then this layer dissolves and the page (wrapped
 * in `.dup-reveal`) fades in. Pure CSS (keyframes in globals.css), so it
 * plays from the first paint, before hydration, and a failed or slow JS load
 * can never leave the page hidden. Reduced motion: no intro at all.
 */
export default function DuplicateIntro() {
  return (
    <div
      aria-hidden="true"
      className="dup-intro pointer-events-none fixed inset-0 z-[200] grid place-items-center bg-white"
    >
      <Image
        src="/assets/logo-mark.webp"
        alt=""
        width={768}
        height={768}
        priority
        // The mark is scaled far past its box during the expand; the 768px
        // source keeps it crisp longer than an optimizer-picked candidate.
        unoptimized
        className="dup-intro-mark size-24 rounded-[22%] md:size-28"
      />
    </div>
  );
}
