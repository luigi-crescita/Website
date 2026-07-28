"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { LiquidGlassCard } from "@/components/kokonutui/liquid-glass-card";

type LeadSource = {
  name: string;
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
const LEAD_SOURCES: LeadSource[] = [
  { name: "Email", logo: "gmail.png" },
  { name: "Instagram DM", logo: "instagram.png", fit: "cover" },
  { name: "Facebook Message", logo: "facebook.png" },
  { name: "Website Form", logo: "website.png" },
  { name: "TikTok DM", logo: "tiktok.png" },
  { name: "Slack Message", logo: "slack.png" },
  { name: "Meta Lead", logo: "meta.png", size: { width: 57, height: 32 } },
  { name: "Google Ads Lead", logo: "google-ads.png", crop: { width: 51, height: 29, left: -12, top: 3 } },
  { name: "WhatsApp Message", logo: "whatsapp-business.png" },
  { name: "Form Submission", logo: "forms.png" },
  { name: "Shopify Sale", logo: "shopify.png" },
  { name: "Telegram Message", logo: "telegram.png" },
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

// Part 2 (revised): video is full-bleed, ~2.5s of usable footage. All 12
// cards converge to the exact same X/Y (a true stack) and then vanish
// together — no card lingers solo — so the video's cut lines up with the
// moment every card is gone. The title fades out here too, once we "get to
// the video".
const VIDEO_FADE_START = 0.637;
const VIDEO_FADE_END = 0.672;
const PULL_START = VIDEO_FADE_END;
const STACK_REACHED = 0.822; // all 12 fully overlapping
const CULL_END = 0.857; // every card gone; video is frozen at its cut frame here too

const VIDEO_CUT_SECONDS = 2.5; // never let the clip play past this

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
  index,
  progress,
  offset,
  cardRef,
}: {
  source: LeadSource;
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
        className="flex flex-col items-center justify-center gap-2.5 rounded-2xl bg-black/40 py-6"
      >
        {icon}
        <span className="text-xs font-medium text-white/85">{source.name}</span>
      </LiquidGlassCard>
    </motion.div>
  );
}

export function LeadSourcesIntro() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const { cardRefs, offsets } = useConvergenceOffsets(gridRef, TOTAL);

  const titleOpacity = useTransform(
    scrollYProgress,
    [0, TITLE_IN_END, VIDEO_FADE_START, VIDEO_FADE_END],
    [0, 1, 1, 0]
  );
  const andMoreOpacity = useTransform(
    scrollYProgress,
    [AND_MORE_IN_START, AND_MORE_IN_END, VIDEO_FADE_START, VIDEO_FADE_END],
    [0, 1, 1, 0]
  );
  const andMoreY = useTransform(scrollYProgress, [AND_MORE_IN_START, AND_MORE_IN_END], [16, 0]);
  const videoOpacity = useTransform(scrollYProgress, [VIDEO_FADE_START, VIDEO_FADE_END], [0, 1]);

  useEffect(() => {
    videoRef.current?.pause();
  }, []);

  // The video's own timeline is scroll-scrubbed too, not autoplaying on its
  // own clock — otherwise stopping mid-scroll wouldn't hold, it'd keep
  // playing toward its end on its own.
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const video = videoRef.current;
    if (!video) return;
    const local = Math.min(1, Math.max(0, (p - VIDEO_FADE_START) / (CULL_END - VIDEO_FADE_START)));
    const target = local * VIDEO_CUT_SECONDS;
    if (Math.abs(video.currentTime - target) > 0.03) {
      video.currentTime = target;
    }
  });

  const grid = (
    <div ref={gridRef} className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {LEAD_SOURCES.map((source, i) => (
        <LeadSourceCard
          key={source.name}
          source={source}
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
      <span className="block font-mono text-xs tracking-[0.2em] text-brand-2 uppercase">How It Works</span>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
        Leads arrive from everywhere.
      </h2>
    </div>
  );

  if (reducedMotion) {
    return (
      <section id="how-it-works-intro" className="relative border-t border-border py-24 sm:py-32">
        <div className="mx-auto w-full max-w-5xl px-6 sm:px-10">
          {title}
          {grid}
          <p className="mt-8 text-center font-mono text-sm tracking-wide text-muted-foreground">and more...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="how-it-works-intro" ref={sectionRef} className="relative h-[480vh]">
      <div className="sticky top-0 flex h-screen w-full items-center overflow-hidden border-t border-border">
        {/* Tunnel video — full background size now, behind the grid. */}
        <motion.div aria-hidden style={{ opacity: videoOpacity }} className="pointer-events-none absolute inset-0 z-0">
          <video
            ref={videoRef}
            muted
            playsInline
            preload="auto"
            className="h-full w-full object-cover"
            src="/videos/Background-3D-tunnel.mp4"
          />
          {/* Covers the "Kling AI" watermark (source clip's bottom-right
              corner). Fixed pixel size rather than percentage, since the
              container's aspect ratio now varies with viewport instead of
              staying a fixed square. */}
          <div className="pointer-events-none absolute right-0 bottom-0 h-20 w-48 bg-black/85 backdrop-blur-lg" />
        </motion.div>

        <div className="relative z-10 mx-auto w-full max-w-5xl px-6 sm:px-10">
          <motion.div style={{ opacity: titleOpacity }}>{title}</motion.div>
          {grid}
          <motion.p
            style={{ opacity: andMoreOpacity, y: andMoreY }}
            className="mt-8 text-center font-mono text-sm tracking-wide text-muted-foreground"
          >
            and more...
          </motion.p>
        </div>
      </div>
    </section>
  );
}
