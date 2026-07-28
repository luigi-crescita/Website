"use client";

import { motion, useScroll, useTransform } from "motion/react";

// Self-contained noise tile (feTurbulence) — no external image asset.
const GRAIN_URL =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";

/**
 * A fixed, full-viewport background layer: grain texture plus two soft glow
 * blobs whose position and opacity are tied directly to scroll progress —
 * quiet, continuous movement instead of a static flat-black page.
 */
export function AmbientBackground() {
  const { scrollYProgress } = useScroll();

  const brandY = useTransform(scrollYProgress, [0, 1], ["-15%", "55%"]);
  const brandOpacity = useTransform(scrollYProgress, [0, 0.6, 1], [0.55, 0.3, 0.12]);
  const brand2Y = useTransform(scrollYProgress, [0, 1], ["25%", "-15%"]);
  const brand2Opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.12, 0.32, 0.5]);

  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden bg-background">
      <motion.div
        className="absolute -left-[10%] size-[560px] rounded-full bg-brand blur-[130px]"
        style={{ top: brandY, opacity: brandOpacity }}
      />
      <motion.div
        className="absolute -right-[8%] size-[520px] rounded-full bg-brand-2 blur-[140px]"
        style={{ top: brand2Y, opacity: brand2Opacity }}
      />
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-overlay"
        style={{ backgroundImage: `url("${GRAIN_URL}")` }}
      />
    </div>
  );
}
