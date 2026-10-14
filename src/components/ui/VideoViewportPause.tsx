"use client";

import { useEffect } from "react";

// Resume slightly before the video scrolls back in so it is already running by
// the time it is visible, instead of showing a frozen frame for a beat.
const ROOT_MARGIN = "200px";

/**
 * Pauses every <video> on the page while it is outside the viewport and resumes
 * it when it comes back.
 *
 * Mounted once in the root layout rather than per-component on purpose: videos
 * live in 8 different components, and some are rendered many times over (the
 * career marquee duplicates its items 6x via InfiniteRow), so a single observer
 * plus a MutationObserver covers copies and anything mounted later — including
 * AnimatePresence children — with no per-call-site wiring.
 *
 * Only videos this component paused are ever resumed, so a video that was
 * already paused for some other reason stays paused.
 */
export default function VideoViewportPause() {
  useEffect(() => {
    const pausedByUs = new WeakSet<HTMLVideoElement>();
    const observed = new Set<HTMLVideoElement>();

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const video = entry.target as HTMLVideoElement;

          if (entry.isIntersecting) {
            if (pausedByUs.has(video)) {
              pausedByUs.delete(video);
              // Rejects if the play attempt is interrupted (e.g. the element is
              // removed mid-scroll) — nothing to recover, so swallow it.
              video.play().catch(() => {});
            }
          } else if (!video.paused) {
            pausedByUs.add(video);
            video.pause();
          }
        }
      },
      { rootMargin: ROOT_MARGIN },
    );

    const collect = (node: Node): HTMLVideoElement[] => {
      if (node instanceof HTMLVideoElement) return [node];
      if (node instanceof HTMLElement || node instanceof Document) {
        return [...node.querySelectorAll("video")];
      }
      return [];
    };

    const observe = (node: Node) => {
      for (const video of collect(node)) {
        if (observed.has(video)) continue;
        observed.add(video);
        io.observe(video);
      }
    };

    observe(document);

    const mo = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) observe(node);
        for (const node of record.removedNodes) {
          for (const video of collect(node)) {
            observed.delete(video);
            io.unobserve(video);
          }
        }
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      io.disconnect();
    };
  }, []);

  return null;
}
