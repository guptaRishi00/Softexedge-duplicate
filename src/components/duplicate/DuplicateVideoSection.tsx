"use client";

import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/**
 * /duplicate showreel: a rounded video card that sits just below the
 * one-screen hero, rises in small from the first scroll and grows until it
 * fills the screen minus a padded margin, then holds pinned briefly; scrolling back
 * shrinks it. The growth is a CSS scroll-driven animation (`.dup-reel*` /
 * `.dup-video-card` in globals.css), so it runs on the compositor with no
 * scroll listener; browsers without support (Firefox) and reduced-motion users
 * get the card at full size in a one-screen section (progressive enhancement).
 *
 * Video loading: `preload="none"` and an autoplay only at md+, so phones
 * never download the mp4 on their own -- they show the poster and the play
 * button fetches it on demand.
 */
export default function DuplicateVideoSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    // Mirror the real element state: VideoViewportPause also pauses/resumes
    // this video when it leaves/enters the viewport.
    const sync = () => setPlaying(!video.paused);
    video.addEventListener("play", sync);
    video.addEventListener("pause", sync);
    if (window.matchMedia("(min-width: 768px)").matches) {
      video.play().catch(() => {});
    }
    return () => {
      video.removeEventListener("play", sync);
      video.removeEventListener("pause", sync);
    };
  }, []);

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  };

  return (
    <section
      aria-label="Showreel"
      className="dup-reel relative w-full"
    >
      {/* Stage = one screen. With scroll-driven support the stage sticks once
          it reaches the top, by which point the card has finished growing
          (see globals.css). */}
      <div className="dup-reel-stage h-[100svh] w-full p-3 md:p-6">
        <div className="dup-video-card relative h-full w-full overflow-hidden rounded-[20px] bg-[#0A0A0A]">
          <video
            ref={videoRef}
            src="/assets/video6.mp4"
            poster="/assets/video6-poster.jpg"
            preload="none"
            loop
            muted
            playsInline
            // Decorative: the button below is the control, so keep the element
            // itself out of the accessibility tree and the tab order.
            aria-hidden="true"
            tabIndex={-1}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? "Pause video" : "Play video"}
            // Solid tint + hairline, not backdrop-blur: blur over a playing
            // video is recomputed every frame.
            className="absolute top-1/2 left-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-black/40 text-white ring-1 ring-white/25 transition-[background-color,scale] duration-200 hover:bg-black/60 active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:size-20"
          >
            {playing ? (
              <Pause
                aria-hidden="true"
                className="size-7"
                fill="currentColor"
              />
            ) : (
              <Play aria-hidden="true" className="size-7" fill="currentColor" />
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
