"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { Check, X } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

type Platform = {
  logo: string;
  /** "cover" crops a letterboxed source (transparent padding on the sides
   * of an off-square canvas) down to its actual mark — used for logos
   * whose source file isn't square. Measured directly from instagram.png's
   * alpha channel (711×351, a roughly square mark centered in a wide
   * canvas), so cropping the sides via object-cover recovers a
   * correctly-sized, undistorted icon instead of the squashed rendering a
   * plain width/height Image gives a non-square source. */
  fit?: "cover";
  /** google-ads.png (666×375) isn't just letterboxed — it's a full
   * lockup: the triangle glyph occupies y 14–265, and a separate
   * "Google Ads" wordmark sits below it at y ~304–375. A plain
   * object-cover crop keeps both stacked, shrinking the glyph to fit;
   * this instead renders the image oversized and shifts it so only the
   * glyph's own bounding box (measured directly from the PNG's alpha
   * channel: x 196–470, y 14–265) lands inside the visible box, sized to
   * match the other icons and the wordmark cropped away entirely. */
  crop?: { width: number; height: number; left: number; top: number };
};

// Order must stay aligned with dict.aiQualification.platformNames.
const PLATFORMS: Platform[] = [
  { logo: "gmail.png" },
  { logo: "instagram.png", fit: "cover" },
  { logo: "facebook.png" },
  { logo: "whatsapp-business.png" },
  { logo: "google-ads.png", crop: { width: 74, height: 42, left: -19, top: 2 } },
  { logo: "telegram.png" },
];

const QUALIFIED_ROW = 3; // WhatsApp Message — the one lead moving forward

// true = check, false = cross. Row QUALIFIED_ROW is all-true by design; every
// other row is a deliberate, realistic mix (never all-true, never all-false).
const RESULTS: boolean[][] = [
  [false, true, true, false],
  [true, true, false, false],
  [false, false, true, false],
  [true, true, true, true],
  [true, false, true, true],
  [false, true, false, false],
];

const ROWS = PLATFORMS.length;
const COLS = 4; // criteria count — structural, same for every locale
const TOTAL_CELLS = ROWS * COLS;

// Scroll-progress choreography (fractions of this section's own pinned
// range, 0..1) — the table frame appears first, "Thinking..." plays while
// cells fill in a scattered (not row-by-row) order, then the qualifying row
// is revealed. The table stays fully visible from the highlight through a
// hold, then fades right at the very end. The active sequence (structure
// through highlight) keeps the same absolute scroll pacing as before; only
// the idle hold/fade tail was shortened, with section height reduced to
// match, so the handoff to the next section is quicker.
const STRUCTURE_END = 0.071;
const THINKING_IN_START = 0.059;
const THINKING_IN_END = 0.142;
const CELL_FILL_START = 0.166;
const CELL_FILL_END = 0.735;
const CELL_TRANSITION = 0.03;
const THINKING_OUT_START = 0.711;
const THINKING_OUT_END = 0.782;
const HIGHLIGHT_START = 0.758;
const HIGHLIGHT_END = 0.83;
const FADE_OUT_START = 0.92;
const FADE_OUT_END = 1;

// A fixed scatter order (not literal randomness — deterministic, but jumps
// between rows) so the fill reads as "evaluating", not a mechanical sweep.
// It's a permutation of 0..23 (cellIndex = row * COLS + col).
const REVEAL_ORDER = [
  2, 13, 21, 5, 9, 16, 0, 22, 6, 14, 18, 3, 10, 23, 1, 15, 7, 19, 11, 20, 4, 17, 8, 12,
];
const REVEAL_POSITION = new Array(TOTAL_CELLS) as number[];
REVEAL_ORDER.forEach((cellIndex, position) => {
  REVEAL_POSITION[cellIndex] = position;
});

const CELL_STAGGER = (CELL_FILL_END - CELL_FILL_START - CELL_TRANSITION) / (TOTAL_CELLS - 1);

function ResultCell({ row, col, progress }: { row: number; col: number; progress: MotionValue<number> }) {
  const cellIndex = row * COLS + col;
  const start = CELL_FILL_START + REVEAL_POSITION[cellIndex] * CELL_STAGGER;
  const end = start + CELL_TRANSITION;

  const opacity = useTransform(progress, [start, end], [0, 1]);
  const scale = useTransform(progress, [start, end], [0.5, 1]);
  const isMatch = RESULTS[row][col];

  return (
    <motion.div style={{ opacity, scale }} className="flex items-center justify-center">
      {isMatch ? (
        <Check className="size-4 text-brand-2-dark" strokeWidth={2.5} />
      ) : (
        <X className="size-4 text-black/30" strokeWidth={2.5} />
      )}
    </motion.div>
  );
}

function ThinkingIndicator({ progress, label }: { progress: MotionValue<number>; label: string }) {
  const opacity = useTransform(
    progress,
    [THINKING_IN_START, THINKING_IN_END, THINKING_OUT_START, THINKING_OUT_END],
    [0, 1, 1, 0]
  );

  return (
    <motion.div style={{ opacity }} className="mb-8 flex items-center justify-center gap-2">
      <span className="font-mono text-sm tracking-wide text-brand-2-dark">{label}</span>
      <span className="flex gap-0.5">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            animate={{ opacity: [0.25, 1, 0.25] }}
            transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" }}
            className="font-mono text-sm text-brand-2-dark"
          >
            .
          </motion.span>
        ))}
      </span>
    </motion.div>
  );
}

export function AiQualification() {
  const { dict } = useLanguage();
  const CRITERIA = dict.aiQualification.criteria;
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const structureOpacity = useTransform(
    scrollYProgress,
    [0, STRUCTURE_END, FADE_OUT_START, FADE_OUT_END],
    [0, 1, 1, 0]
  );
  const highlightOpacity = useTransform(scrollYProgress, [HIGHLIGHT_START, HIGHLIGHT_END], [0, 1]);

  const introText = (
    <div className="lg:w-72 lg:shrink-0">
      <span className="block font-mono text-xs tracking-[0.2em] text-brand-2-dark uppercase">{dict.aiQualification.eyebrow}</span>
      <p className="mt-4 text-xl leading-snug font-medium text-balance text-black/85 sm:text-2xl">
        {dict.aiQualification.intro}
      </p>
    </div>
  );

  const table = (
    <div className="w-full overflow-x-auto lg:w-auto lg:max-w-[680px]">
      {/* The table sits directly on the warm clip, so it carries its own light
          scrim (bg-white/35 + blur) — without it the checks and rules read as
          noise over whichever frame happens to be playing. */}
      <div className="min-w-[640px] overflow-hidden rounded-2xl border border-black/15 bg-white/35 backdrop-blur-sm">
        <div
          className="grid items-center border-b border-black/15 bg-white/45"
          style={{ gridTemplateColumns: "1.6fr repeat(4, 1fr)" }}
        >
          <div className="px-5 py-3" />
          {CRITERIA.map((label) => (
            <div
              key={label}
              className="px-2 py-3 text-center text-xs font-semibold tracking-wide text-black/60 uppercase"
            >
              {label}
            </div>
          ))}
        </div>

        {PLATFORMS.map((platform, row) => {
          const isQualified = row === QUALIFIED_ROW;
          const platformName = dict.aiQualification.platformNames[row];
          return (
            <div key={platform.logo} className="relative">
              {isQualified && (
                <motion.div
                  aria-hidden
                  style={{ opacity: highlightOpacity }}
                  className="absolute inset-0 border-y border-brand-2-dark/50 bg-brand-2-dark/15"
                />
              )}
              <div
                className="relative grid items-center border-b border-black/10 last:border-b-0"
                style={{ gridTemplateColumns: "1.6fr repeat(4, 1fr)" }}
              >
                <div className="flex items-center gap-3 px-5 py-4">
                  <div
                    className={[
                      "relative size-9 shrink-0",
                      platform.fit === "cover" || platform.crop ? "overflow-hidden rounded-sm" : "",
                    ].join(" ")}
                  >
                    {platform.fit === "cover" ? (
                      <Image
                        src={`/images/${platform.logo}`}
                        alt=""
                        aria-hidden
                        fill
                        className="object-cover opacity-90"
                      />
                    ) : platform.crop ? (
                      <Image
                        src={`/images/${platform.logo}`}
                        alt=""
                        aria-hidden
                        width={platform.crop.width}
                        height={platform.crop.height}
                        className="absolute max-w-none opacity-90"
                        style={{ left: platform.crop.left, top: platform.crop.top }}
                      />
                    ) : (
                      <Image
                        src={`/images/${platform.logo}`}
                        alt=""
                        aria-hidden
                        width={36}
                        height={36}
                        className="opacity-90"
                      />
                    )}
                  </div>
                  <span className="text-sm font-medium text-black/85">{platformName}</span>
                </div>
                {CRITERIA.map((_, col) => (
                  <ResultCell key={col} row={row} col={col} progress={scrollYProgress} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  if (reducedMotion) {
    return (
      <section id="ai-qualification" className="relative py-24 sm:py-32">
        {/* lg:pr-32 keeps this content clear of the fixed scroll-progress
            line, which occupies a strip at the far right edge from lg up. */}
        <div className="mx-auto w-full max-w-6xl px-6 sm:px-10 lg:pr-32">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
            {introText}
            <div className="w-full lg:w-auto">
              <div className="mb-8 text-center font-mono text-sm text-brand-2-dark">{dict.aiQualification.thinking}...</div>
              {table}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="ai-qualification" ref={sectionRef} className="relative h-[460vh]">
      <div className="sticky top-0 flex h-screen w-full items-center overflow-hidden">
        {/* lg:pr-32 keeps this content clear of the fixed scroll-progress
            line, which occupies a strip at the far right edge from lg up. */}
        <motion.div
          style={{ opacity: structureOpacity }}
          className="mx-auto w-full max-w-6xl px-6 sm:px-10 lg:pr-32"
        >
          <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
            {introText}
            <div className="w-full lg:w-auto">
              <ThinkingIndicator progress={scrollYProgress} label={dict.aiQualification.thinking} />
              {table}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
