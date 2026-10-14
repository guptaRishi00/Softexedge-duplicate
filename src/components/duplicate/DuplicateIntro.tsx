import Image from "next/image";

/**
 * Hero intro, after the Metalab hero: the SoftexEdge mark small and centred
 * on navy, then a box opens out of it to the full screen, revealing the
 * header and hero inside it (the page wrapper `.dup-reveal` is clipped to
 * the box). Pure CSS (keyframes in globals.css), so it plays from the first
 * paint, before hydration, and a failed or slow JS load can never leave the
 * page hidden. Reduced motion: no intro at all.
 *
 * The navy is the mark's own badge colour, so the badge's rounded corners
 * disappear into it and only the S reads.
 */
export default function DuplicateIntro() {
  return (
    <div
      aria-hidden="true"
      className="dup-intro pointer-events-none fixed inset-0 z-0 grid place-items-center"
    >
      <Image
        src="/assets/logo-mark.webp"
        alt=""
        width={768}
        height={768}
        priority
        // The source (17 KB) keeps the badge navy exact; the optimizer's
        // re-encode shifts it enough to show a square on the #03024b layer.
        unoptimized
        className="dup-intro-logo size-28 md:size-36"
      />
    </div>
  );
}
