"use client";

import { type ComponentProps, useEffect, useRef } from "react";

/**
 * A `<video>` that only starts (and only downloads) on viewports >= md.
 *
 * `autoPlay` on a plain <video> makes every phone fetch the whole file before
 * anything is decided about it: /about pulled 8.9 MB and /career 14.5 MB of
 * mp4 on a mobile Lighthouse run, starving the LCP image. `preload="none"`
 * defers the fetch until `play()`, and the effect below only calls `play()`
 * above md -- so a phone shows the `poster` frame and never touches the mp4.
 * Desktop behaves exactly as `autoPlay` did; `ui/VideoViewportPause` still
 * pauses it offscreen and resumes it, because it only resumes videos it
 * paused itself.
 *
 * Same pattern as `home/Herosection.tsx`, which keeps its own copy because
 * its canvas loop is coupled to the play event.
 */
export default function DesktopAutoplayVideo(
  props: Omit<ComponentProps<"video">, "autoPlay" | "preload">,
) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (!window.matchMedia("(min-width: 768px)").matches) return;
    video.play().catch(() => {});
  }, []);

  return (
    <video ref={ref} preload="none" loop muted playsInline {...props} />
  );
}
