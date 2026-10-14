"use client";
import { useEffect, useState } from "react";

export function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return isDesktop;
}

// Unlike useIsDesktop, this reads matchMedia during the FIRST client render, so
// it is already correct when a mount animation fires — useIsDesktop starts false
// everywhere and only flips in an effect, which lands after framer has consumed
// `initial`.
//
// Use it ONLY for props that emit no markup, i.e. `transition`. Gating
// `initial`/`animate` on it would make the client's first render disagree with
// the SSR output (the server cannot know the viewport) and trip hydration.
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () =>
      typeof window !== "undefined" &&
      !window.matchMedia("(min-width: 768px)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setIsMobile(!mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return isMobile;
}

// Zero-duration, zero-delay: the element lands on its target values on the first
// frame, so the content is simply there instead of easing in.
export const NO_ENTRY = { duration: 0 } as const;
