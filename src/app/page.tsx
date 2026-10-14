import type { Metadata } from "next";
import DuplicateHero from "@/components/duplicate/DuplicateHero";
import DuplicateIntro from "@/components/duplicate/DuplicateIntro";
import DuplicateServices from "@/components/duplicate/DuplicateServices";
import DuplicateVideoSection from "@/components/duplicate/DuplicateVideoSection";
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
      <DuplicateIntro />
      {/* The intro's opening box clips this wrapper (globals.css). Never a
          transform here: it would become the containing block for the
          header's fixed navbar. */}
      <div className="dup-reveal">
        <Header dropdown />
        <DuplicateHero />
        <DuplicateVideoSection />
        <DuplicateServices />
      </div>
    </main>
  );
}
