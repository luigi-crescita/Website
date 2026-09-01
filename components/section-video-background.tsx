"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * The warm background clip shared by the two scroll-pinned sections
 * (LeadSourcesIntro, AiQualification). Two deliberate properties:
 *
 * - The clip runs on its own clock — autoplay + loop — instead of having its
 *   currentTime scrubbed from scroll progress, so it keeps moving while the
 *   reader sits still and never freezes on a cut frame.
 * - The *layer* still gets a one-shot entrance: it fades up and settles out of
 *   a slight overscale the first time the section reaches the viewport. That
 *   trigger is viewport-based, not scroll-linked, so scrolling back up doesn't
 *   rewind it while the footage keeps playing underneath.
 *
 * The footage is warm and bright, which is why both sections switch their type
 * to black; the scrim below lifts the darker frames just enough to keep that
 * type readable without washing the colour out of the clip.
 */
export function SectionVideoBackground({ className }: { className?: string }) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      aria-hidden
      initial={reducedMotion ? false : { opacity: 0, scale: 1.08 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
      className={cn("pointer-events-none absolute inset-0 z-0", className)}
    >
      <video
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
  );
}
