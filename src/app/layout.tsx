import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import IosClickRescue from "@/components/ui/IosClickRescue";
import VideoViewportPause from "@/components/ui/VideoViewportPause";
import { cn } from "@/lib/utils";
import { SITE_URL } from "@/lib/site";

// Loaded here rather than via @font-face in globals.css so Next emits a
// <link rel="preload"> for the woff2 (it used to be discovered only after the
// stylesheet was parsed) and a metric-matched fallback for the swap period.
// The variable is what globals.css's --font-sans points at.
const satoshi = localFont({
  src: "../../public/fonts/Satoshi-Variable.woff2",
  weight: "100 900",
  display: "swap",
  variable: "--font-satoshi",
});

// Notch / browser-chrome colour for every route: solid white, site-wide.
// This is only half of the notch colour. globals.css still paints the <html>
// canvas black below 768px, and newer iOS Safari takes the notch colour from
// that canvas, so phones can still show a black notch. Change the two
// together. /contact, /work and /work/[slug] also override this to black.
export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Softexedge — Digital Agency",
    template: "%s | Softexedge",
  },
  description:
    "Softexedge is the digital agency behind the minds shaping brand strategy, web and app development, UI/UX design, and marketing that people trust.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(satoshi.variable, "h-full", "antialiased", "font-sans")}
    >
      <body className="min-h-full flex flex-col">
        <VideoViewportPause />
        {/* Touch devices only: re-dispatches the click iOS withholds when the
            page mutates during a tap's synthetic hover pass. */}
        <IosClickRescue />
        {children}
      </body>
    </html>
  );
}
