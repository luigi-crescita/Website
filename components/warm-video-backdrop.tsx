"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";

/**
 * The single warm backdrop behind LeadSourcesIntro + AiQualification.
 *
 * It wraps both sections rather than living inside either one, so there is
 * exactly one <video> spanning their combined scroll range — the two sections
 * read as one continuous scene with no seam or handoff where the first ends
 * and the second begins.
 *
 * The clip runs on its own clock. Driving its timeline from scroll was tried
 * and dropped: seeking on every scroll event never buffered cleanly, so
 * playback is decoupled from scroll entirely and only the entrance is
 * scroll-triggered.
 */

/** Just under real time, so the footage drifts behind the copy rather than
 *  churning against it. */
const PLAYBACK_RATE = 0.9;

/** How far through the wrapper's approach (its top travelling from the bottom
 *  of the viewport to the top) the entrance commits, so the panel is fully up
 *  by the time the first section locks to the top. */
const ENTRANCE_TRIGGER = 0.55;

export function WarmVideoBackdrop({ children }: { children: React.ReactNode }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reducedMotion = useReducedMotion();

  // Only the entrance reads scroll. Driven from the wrapper's approach rather
  // than `whileInView` so it rides the same measurement the two sections
  // already animate from, instead of adding an IntersectionObserver whose
  // timing against a sticky, pinned panel is a separate thing to reason about.
  const { scrollYProgress: approachProgress } = useScroll({
    target: wrapRef,
    offset: ["start end", "start start"],
  });

  const [entered, setEntered] = useState(false);
  useMotionValueEvent(approachProgress, "change", (p) => {
    if (p >= ENTRANCE_TRIGGER) setEntered(true);
  });
  // Covers a reload that lands mid-page, where no change event ever fires.
  // Deferred a frame so the read happens after motion's first measurement.
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (approachProgress.get() >= ENTRANCE_TRIGGER) setEntered(true);
    });
    return () => cancelAnimationFrame(frame);
  }, [approachProgress]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // A source load resets playbackRate, and browsers only honour it once the
    // element actually has media to rate-control — so re-assert it on those
    // events rather than once on mount.
    const applyRate = () => {
      video.playbackRate = PLAYBACK_RATE;
    };
    applyRate();
    video.addEventListener("loadedmetadata", applyRate);
    video.addEventListener("play", applyRate);

    if (reducedMotion) {
      video.pause();
    } else {
      // The autoPlay attribute covers the normal case; this catches a mount
      // that happened while the tab was backgrounded, where the initial play
      // is deferred and never retried.
      video.play().catch(() => {});
    }

    return () => {
      video.removeEventListener("loadedmetadata", applyRate);
      video.removeEventListener("play", applyRate);
    };
  }, [reducedMotion]);

  return (
    <div ref={wrapRef} className="relative border-t border-border">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="sticky top-0 h-screen">
          {/* The panel is inset from the viewport, but always by less than the
              sections' own horizontal padding (px-6 / sm:px-10) — black type
              must never spill off the light panel onto the dark page behind. */}
          <motion.div
            aria-hidden
            initial={false}
            animate={reducedMotion || entered ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.06 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-x-3 inset-y-6 overflow-hidden rounded-2xl sm:inset-x-6 sm:inset-y-10 sm:rounded-3xl"
          >
            <video
              ref={videoRef}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              className="h-full w-full object-cover"
              src="/videos/higgsfield-bg-video.mp4"
            />
            <div className="absolute inset-0 bg-white/35" />
          </motion.div>
        </div>
      </div>

      <div className="relative z-10">{children}</div>
    </div>
  );
}
