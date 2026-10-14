import type { Metadata } from "next";
import DuplicateHero from "@/components/duplicate/DuplicateHero";
import DuplicateServices from "@/components/duplicate/DuplicateServices";
import DuplicateVideoSection from "@/components/duplicate/DuplicateVideoSection";
import PortfolioSection from "@/components/duplicate/PortfolioSection";
import Header from "@/components/page/Header";

export const metadata: Metadata = {
  description:
    "We build digital businesses, not just websites: brand, product, and the marketing that follows, from one team.",
  // A copy of softexedge-sept-2026's design work, so keep it out of search results.
  robots: { index: false, follow: true },
};

// Moved here from softexedge-sept-2026's /duplicate route (2026-10-14).
// The header is that project's `page/Header` (dark links for a white page).
export default function Home() {
  return (
    <main className="w-full bg-white">
      {/* The intro: on blank white, a centre line opens to the full screen,
          clipping this wrapper (globals.css). Never a transform here: it
          would become the containing block for the header's fixed navbar. */}
      <div className="dup-reveal">
        <Header dropdown />
        <DuplicateHero />
        <DuplicateVideoSection />
        {/* Portfolio = softexedge-sept-2026's home PortfolioSection, verbatim
            (GSAP-pinned horizontal scroll on desktop, snap carousel on
            phones), in the same raised dark wrapper the home page uses. On
            desktop it slides up over the pinned showreel (`.dup-reel-cover`,
            globals.css) and, like home, the next block is pulled up 100vh
            over the portfolio's end-of-scroll hold. */}
        <div className="dup-reel-cover relative z-10 bg-[#0a0a0a] lg:shadow-[0_-8px_16px_-2px_rgb(0_0_0_/_0.18),0_-4px_8px_-4px_rgb(0_0_0_/_0.15)]">
          <PortfolioSection />
        </div>
        <div className="relative z-20 md:-mt-[100vh]">
          <DuplicateServices />
        </div>
      </div>
    </main>
  );
}
