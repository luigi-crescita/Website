"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";

/**
 * The single warm backdrop behind LeadSourcesIntro + AiQualification.
 *
 * It wraps both sections rather than living inside either one, so there is
 * exactly one <video> pinned across their combined scroll range — the two
 * sections read as one continuous scene with no seam or handoff where the
 * first ends and the second begins.
 *
 * Playback is scroll-driven and wrapping: scroll position maps onto the clip's
 * timeline, so the footage holds still when the reader does, and scrolling
 * past the end restarts it instead of parking on the last frame.
 */

/** Cycles of the clip across the wrapper's scroll range. The source is
 *  ~10.1s and the two sections scroll ~840vh between them, so two passes keep
 *  the footage moving at roughly reading pace while making the wrap itself
 *  visible — a single pass would just play through once and never loop. */
const LOOPS = 2;

/** Don't re-seek for sub-frame deltas; seeking is the expensive part. */
const SEEK_EPSILON = 0.03;

/** How far through the wrapper's approach (its top travelling from the bottom
 *  of the viewport to the top) the entrance commits, so the panel is fully up
 *  by the time the first section locks to the top. */
const ENTRANCE_TRIGGER = 0.55;

export function WarmVideoBackdrop({ children }: { children: React.ReactNode }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reducedMotion = useReducedMotion();

  // Playback range — the wrapper's own pinned range, shared by both sections.
  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start start", "end end"],
  });
  // Approach range, used only to latch the entrance. Driven from scroll rather
  // than `whileInView` so the entrance rides the exact same measurement the
  // two sections already animate from, instead of adding an IntersectionObserver
  // whose timing against a sticky, pinned panel is a separate thing to reason
  // about.
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

  const seekTo = useCallback(
    (p: number) => {
      const video = videoRef.current;
      if (!video || reducedMotion) return;

      const { duration } = video;
      if (!Number.isFinite(duration) || duration === 0) return;

      // The doubled modulo keeps a progress value that momentarily overshoots
      // its 0..1 range from landing on a negative currentTime.
      const wrapped = ((((p * LOOPS) % 1) + 1) % 1) * duration;
      if (Math.abs(video.currentTime - wrapped) > SEEK_EPSILON) {
        video.currentTime = wrapped;
      }
    },
    [reducedMotion]
  );

  useMotionValueEvent(scrollYProgress, "change", seekTo);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Never plays on its own clock — scroll is the only thing that advances it.
    video.pause();

    // Metadata routinely lands after the reader has already scrolled into the
    // range; without this catch-up the clip would sit on frame 0 until the
    // next scroll event happened to fire.
    const onLoadedMetadata = () => seekTo(scrollYProgress.get());
    video.addEventListener("loadedmetadata", onLoadedMetadata);
    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) onLoadedMetadata();

    return () => video.removeEventListener("loadedmetadata", onLoadedMetadata);
  }, [seekTo, scrollYProgress]);

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
              muted
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
