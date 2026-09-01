"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { LiquidGlassCard } from "@/components/kokonutui/liquid-glass-card";
import { useLanguage } from "@/lib/i18n/language-context";

type LeadSource = {
  logo: string;
  /** Explicit width/height for icons whose natural shape is inherently
   * wider/shorter than the default ~30px square — e.g. meta.png's mark is
   * a wide glyph (measured: content spans ~82% of canvas width but only
   * ~30% of its height), so it needs more horizontal room to read at the
   * same visual weight as the square icons instead of being shrunk down
   * to fit a square box. */
  size?: { width: number; height: number };
  /** "cover" crops a letterboxed source (transparent padding baked into
   * the sides of an off-square canvas) down to its actual mark.
   * instagram.png (711×351) has a roughly square glyph centered in a wide
   * canvas — cropping the sides via object-cover in a fixed square box
   * recovers a correctly-sized, undistorted icon instead of the squashed
   * rendering a plain width/height Image gives a non-square source. */
  fit?: "cover";
  /** google-ads.png (666×375) is a full lockup, not just letterboxed: the
   * triangle glyph occupies y 14–265, and a separate "Google Ads"
   * wordmark sits below it at y ~304–375 (confirmed via a row-by-row
   * alpha-coverage scan). A plain object-cover crop keeps both stacked,
   * shrinking the glyph to fit; this instead renders the image oversized
   * and shifts it so only the glyph's own bounding box (x 196–470, y
   * 14–265) lands inside the visible box, wordmark cropped away entirely. */
  crop?: { width: number; height: number; left: number; top: number };
};

// Sizing here isn't uniform pixels — it's calibrated per icon so the
// actual logo MARK (ignoring each file's own baked-in transparent
// padding) reads at a similar visual weight. Measured every asset's alpha
// channel directly: most render fine at the default width=30 (Next Image
// preserves aspect ratio, so non-square sources like forms.png/google-ads
// already come out shorter than 30 without distortion), but three were
// consistently smaller/fainter than the rest — instagram, meta, and
// google-ads — each for a different underlying reason, so each gets a
// different fix below rather than one blanket size bump.
// Order must stay aligned with dict.leadSourcesIntro.sourceNames.
const LEAD_SOURCES: LeadSource[] = [
  { logo: "gmail.png" },
  { logo: "instagram.png", fit: "cover" },
  { logo: "facebook.png" },
  { logo: "website.png" },
  { logo: "tiktok.png" },
  { logo: "slack.png" },
  { logo: "meta.png", size: { width: 57, height: 32 } },
  { logo: "google-ads.png", crop: { width: 51, height: 29, left: -12, top: 3 } },
  { logo: "whatsapp-business.png" },
  { logo: "forms.png" },
  { logo: "shopify.png" },
  { logo: "telegram.png" },
];

const TOTAL = LEAD_SOURCES.length;

// Scroll-progress choreography, expressed as fractions of this section's own
// pinned scroll range (0..1) — nothing here is time-based; every value below
// is a position along that range, not a duration. The active sequence below
// (entrance through cull) keeps the same absolute scroll pacing as before;
// only the idle tail after the cull was shortened, and the section height
// shrunk to match, so the handoff into the next section feels tighter.
const TITLE_IN_END = 0.04;
const ENTRANCE_SPAN = 0.405;
const CARD_TRANSITION = 0.058;
const AND_MORE_IN_START = ENTRANCE_SPAN;
const AND_MORE_IN_END = 0.463;

// Part 2: the copy (title + "and more") clears out first, then all 12 cards
// converge to the exact same X/Y — a true stack — and vanish together, so no
// card lingers solo. The background clip is no longer part of this
// choreography: it lives in the wrapper that spans this section and the
// next (see WarmVideoBackdrop), so these are purely the copy/card beats.
const COPY_OUT_START = 0.637;
const COPY_OUT_END = 0.672;
const PULL_START = COPY_OUT_END;
const STACK_REACHED = 0.822; // all 12 fully overlapping
const CULL_END = 0.857; // every card gone

const ENTRANCE_STAGGER = (ENTRANCE_SPAN - CARD_TRANSITION) / (TOTAL - 1);

type Offset = { x: number; y: number };

/**
 * Measures each card's real on-screen offset from the grid's center so the
 * convergence animation can land all 12 at the exact same coordinates — a
 * percentage-of-own-size approximation isn't precise enough for a true
 * stack. Sticky-pinned content doesn't reflow due to scroll, so a
 * mount + ResizeObserver measurement is stable regardless of scroll position.
 */
function useConvergenceOffsets(containerRef: React.RefObject<HTMLDivElement | null>, count: number) {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [offsets, setOffsets] = useState<Offset[]>(() => Array.from({ length: count }, () => ({ x: 0, y: 0 })));

  useEffect(() => {
    function measure() {
      const container = containerRef.current;
      if (!container) return;
      const containerRect = container.getBoundingClientRect();
      const centerX = containerRect.left + containerRect.width / 2;
      const centerY = containerRect.top + containerRect.height / 2;

      setOffsets(
        cardRefs.current.map((el) => {
          if (!el) return { x: 0, y: 0 };
          const r = el.getBoundingClientRect();
          return {
            x: centerX - (r.left + r.width / 2),
            y: centerY - (r.top + r.height / 2),
          };
        })
      );
    }

    measure();
    const observer = new ResizeObserver(measure);
    if (containerRef.current) observer.observe(containerRef.current);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  return { cardRefs, offsets };
}

function LeadSourceCard({
  source,
  name,
  index,
  progress,
  offset,
  cardRef,
}: {
  source: LeadSource;
  name: string;
  index: number;
  progress: MotionValue<number>;
  offset: Offset;
  cardRef: (el: HTMLDivElement | null) => void;
}) {
  const entranceStart = index * ENTRANCE_STAGGER;
  const entranceEnd = entranceStart + CARD_TRANSITION;

  // Every card shares the same exit — none lingers alone after the others
  // vanish; all 12 fade and shrink out together once fully stacked.
  const opacity = useTransform(progress, [entranceStart, entranceEnd, STACK_REACHED, CULL_END], [0, 1, 1, 0]);
  const scale = useTransform(
    progress,
    [entranceStart, entranceEnd, PULL_START, STACK_REACHED, CULL_END],
    [0.75, 1, 1, 0.85, 0.55]
  );
  const x = useTransform(progress, [PULL_START, STACK_REACHED], [0, offset.x]);
  const y = useTransform(progress, [PULL_START, STACK_REACHED], [0, offset.y]);

  let icon: React.ReactNode;
  if (source.fit === "cover") {
    icon = (
      <div className="relative size-[27px] overflow-hidden rounded-sm">
        <Image src={`/images/${source.logo}`} alt="" aria-hidden fill className="object-cover opacity-90" />
      </div>
    );
  } else if (source.crop) {
    icon = (
      <div className="relative size-[27px] overflow-hidden rounded-sm">
        <Image
          src={`/images/${source.logo}`}
          alt=""
          aria-hidden
          width={source.crop.width}
          height={source.crop.height}
          className="absolute max-w-none opacity-90"
          style={{ left: source.crop.left, top: source.crop.top }}
        />
      </div>
    );
  } else {
    const { width, height } = source.size ?? { width: 30, height: 30 };
    icon = <Image src={`/images/${source.logo}`} alt="" aria-hidden width={width} height={height} className="opacity-90" />;
  }

  return (
    <motion.div ref={cardRef} style={{ opacity, scale, translateX: x, translateY: y }}>
      <LiquidGlassCard
        glassSize="sm"
        className="flex flex-col items-center justify-center gap-2.5 rounded-2xl bg-white/45 py-6 ring-black/10"
      >
        {icon}
        <span className="text-xs font-medium text-black/80">{name}</span>
      </LiquidGlassCard>
    </motion.div>
  );
}

export function LeadSourcesIntro() {
  const { dict } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const { cardRefs, offsets } = useConvergenceOffsets(gridRef, TOTAL);

  const titleOpacity = useTransform(
    scrollYProgress,
    [0, TITLE_IN_END, COPY_OUT_START, COPY_OUT_END],
    [0, 1, 1, 0]
  );
  const andMoreOpacity = useTransform(
    scrollYProgress,
    [AND_MORE_IN_START, AND_MORE_IN_END, COPY_OUT_START, COPY_OUT_END],
    [0, 1, 1, 0]
  );
  const andMoreY = useTransform(scrollYProgress, [AND_MORE_IN_START, AND_MORE_IN_END], [16, 0]);

  const grid = (
    <div ref={gridRef} className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {LEAD_SOURCES.map((source, i) => (
        <LeadSourceCard
          key={source.logo}
          source={source}
          name={dict.leadSourcesIntro.sourceNames[i]}
          index={i}
          progress={scrollYProgress}
          offset={offsets[i]}
          cardRef={(el) => {
            cardRefs.current[i] = el;
          }}
        />
      ))}
    </div>
  );

  const title = (
    <div className="mb-10 text-center">
      <span className="block font-mono text-xs tracking-[0.2em] text-brand-2-dark uppercase">{dict.leadSourcesIntro.eyebrow}</span>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-balance text-black sm:text-3xl">
        {dict.leadSourcesIntro.heading}
      </h2>
    </div>
  );

  if (reducedMotion) {
    return (
      <section id="how-it-works-intro" className="relative py-24 sm:py-32">
        <div className="mx-auto w-full max-w-5xl px-6 sm:px-10">
          {title}
          {grid}
          <p className="mt-8 text-center font-mono text-sm tracking-wide text-black/60">{dict.leadSourcesIntro.andMore}</p>
        </div>
      </section>
    );
  }

  return (
    <section id="how-it-works-intro" ref={sectionRef} className="relative h-[480vh]">
      <div className="sticky top-0 flex h-screen w-full items-center overflow-hidden">
        <div className="mx-auto w-full max-w-5xl px-6 sm:px-10">
          <motion.div style={{ opacity: titleOpacity }}>{title}</motion.div>
          {grid}
          <motion.p
            style={{ opacity: andMoreOpacity, y: andMoreY }}
            className="mt-8 text-center font-mono text-sm tracking-wide text-black/60"
          >
            {dict.leadSourcesIntro.andMore}
          </motion.p>
        </div>
      </div>
    </section>
  );
}
