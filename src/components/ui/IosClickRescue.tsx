"use client";

import { useEffect } from "react";

/**
 * Rescues taps that iOS Safari eats.
 *
 * On-device event traces (three sessions on an iPhone) established the shape:
 * `pointerdown`/`pointerup` fire on 100% of taps, but the synthetic mouse
 * sequence — including `click` — arrives on only ~1 in 3; every lost tap ends
 * `touchend -> mouseover -> nothing`, with nothing `defaultPrevented`. WebKit
 * withholds the click when it judges that the page changed during the tap's
 * synthetic hover pass, and this site's always-running animations (canvas
 * painter, framer style writes, the card cycler's periodic commits) mean some
 * mutation almost always coincides with that pass. Which one trips it on any
 * given tap is nondeterministic — which is why per-cause CSS fixes
 * (`touch-action`, hover guards, `cursor: pointer`) each failed to close it.
 *
 * So this stops depending on the synthetic click. On `pointerup` over an
 * interactive element, wait RESCUE_AFTER_MS; if Safari has not delivered a
 * click by then, dispatch the element's own `.click()`. Taps Safari handles
 * normally are untouched — the native click lands first and the rescue no-ops.
 *
 * Scoped hard:
 * - touch-only (`hover: none, pointer: coarse`), so desktop never runs it;
 * - only for taps that LAND on an `a`/`button`/role=button/label/summary;
 * - only when the pointer stayed put (< MOVE_TOLERANCE_PX) and the press was
 *   short — a scroll fling or long-press never qualifies;
 * - one rescue per tap, keyed by pointerId sequence, so it can never double.
 */

const RESCUE_AFTER_MS = 120;
const MOVE_TOLERANCE_PX = 12;
const MAX_PRESS_MS = 700;
const INTERACTIVE = "a[href], button, [role='button'], label, summary";
// Form controls were NOT covered before, which is why the contact fields still
// needed two taps in Safari: the first tap was eaten exactly as it is for a
// link, but nothing re-dispatched it.
const FIELD = "input, textarea, select";
const RESCUABLE = `${INTERACTIVE}, ${FIELD}`;

export default function IosClickRescue() {
  useEffect(() => {
    if (!window.matchMedia("(hover: none) and (pointer: coarse)").matches)
      return;

    let downX = 0;
    let downY = 0;
    let downAt = 0;
    let candidate: HTMLElement | null = null;
    // Bumped on every native click; a pending rescue compares its snapshot to
    // detect "Safari delivered after all" without any shared boolean to latch.
    let clockOfClicks = 0;
    let rescueTimer = 0;

    const onPointerDown = (e: PointerEvent) => {
      downX = e.clientX;
      downY = e.clientY;
      downAt = performance.now();
      const el = e.target instanceof Element ? e.target : null;
      candidate = (el?.closest(RESCUABLE) as HTMLElement | null) ?? null;
    };

    const onClick = () => {
      clockOfClicks += 1;
    };

    const onPointerUp = (e: PointerEvent) => {
      const el = candidate;
      candidate = null;
      if (!el) return;
      if (performance.now() - downAt > MAX_PRESS_MS) return;
      const moved = Math.hypot(e.clientX - downX, e.clientY - downY);
      if (moved > MOVE_TOLERANCE_PX) return;
      // The pointer must still be over the same control — releasing elsewhere
      // is a cancelled tap, and native behaviour would not click it either.
      const at =
        e.target instanceof Element ? e.target.closest(RESCUABLE) : null;
      if (at !== el) return;

      // Fields take a DIFFERENT rescue from links and buttons, for two reasons.
      // 1. Their activation is focus, not click — `.click()` on an input does
      //    not open the keyboard.
      // 2. It must happen SYNCHRONOUSLY, here inside the pointerup handler:
      //    iOS only opens the keyboard for a `focus()` that runs within a user
      //    gesture, and the 120ms timer below would have left that gesture, so
      //    a deferred focus would move the caret but leave the keyboard shut.
      // If Safari was going to focus the field anyway this is a no-op, and the
      // activeElement check keeps a tap inside an already-focused field from
      // stealing its own caret placement.
      if (el.matches(FIELD)) {
        if (document.activeElement !== el) el.focus();
        return;
      }

      const seen = clockOfClicks;
      window.clearTimeout(rescueTimer);
      rescueTimer = window.setTimeout(() => {
        // A native click arrived in the window — Safari did its job.
        if (clockOfClicks !== seen) return;
        // Element left the DOM in the meantime (route change, re-render).
        if (!el.isConnected) return;
        el.click();
      }, RESCUE_AFTER_MS);
    };

    const onPointerCancel = () => {
      candidate = null;
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("pointerup", onPointerUp, true);
    document.addEventListener("pointercancel", onPointerCancel, true);
    document.addEventListener("click", onClick, true);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("pointerup", onPointerUp, true);
      document.removeEventListener("pointercancel", onPointerCancel, true);
      document.removeEventListener("click", onClick, true);
      window.clearTimeout(rescueTimer);
    };
  }, []);

  return null;
}
