"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { motion } from "motion/react";
import { createTimeline, stagger, utils } from "animejs";
import { ArrowRight, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DURATION, EASE_ANIME, STAGGER } from "@/lib/motion";
import { splitWords } from "@/lib/text-reveal";
import { LiquidGlassCard } from "@/components/kokonutui/liquid-glass-card";
import { useLanguage } from "@/lib/i18n/language-context";

// The 3D scene touches WebGL on mount, so it's excluded from the server
// render entirely rather than just deferring hydration.
const HeroScene = dynamic(() => import("@/components/hero-scene").then((m) => m.HeroScene), {
  ssr: false,
});

export function Hero() {
  const { dict } = useLanguage();
  const heroRef = useRef<HTMLElement>(null);
  const eyebrowRef = useRef<HTMLSpanElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const heading = headingRef.current;
    const eyebrow = eyebrowRef.current;
    const sub = subRef.current;
    const cta = ctaRef.current;
    const scene = sceneRef.current;
    const cue = cueRef.current;
    if (!heading) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const { splitter, words } = splitWords(heading);

    const restEls = [eyebrow, sub, cta, scene, cue].filter((el): el is HTMLElement => Boolean(el));

    if (reducedMotion) {
      utils.set(restEls, { opacity: 1, translateY: 0, scale: 1 });
      utils.set(words, { opacity: 1, translateY: 0, filter: "blur(0px)" });
      return () => splitter.revert();
    }

    // Signature hero moment: eyebrow, then the headline resolving into focus
    // word by word, then the subhead, then the 3D scene materializing, and
    // the CTA arriving last — the whole sequence lands around the first ~2s.
    if (eyebrow) utils.set(eyebrow, { opacity: 0, translateY: 16 });
    utils.set(words, { opacity: 0, translateY: 20, filter: "blur(6px)" });
    if (sub) utils.set(sub, { opacity: 0, translateY: 16 });
    if (scene) utils.set(scene, { opacity: 0, scale: 0.92, filter: "blur(8px)" });
    if (cta) utils.set(cta, { opacity: 0, translateY: 14, scale: 0.96 });
    if (cue) utils.set(cue, { opacity: 0 });

    const tl = createTimeline({ defaults: { ease: EASE_ANIME } });

    if (eyebrow) tl.add(eyebrow, { opacity: [0, 1], translateY: [16, 0], duration: DURATION.fast });
    tl.add(
      words,
      {
        opacity: [0, 1],
        translateY: [20, 0],
        filter: ["blur(6px)", "blur(0px)"],
        duration: DURATION.base,
        delay: stagger(STAGGER.tight),
      },
      eyebrow ? "-=150" : 0
    );
    if (sub) tl.add(sub, { opacity: [0, 1], translateY: [16, 0], duration: DURATION.fast }, "-=250");
    if (scene) {
      tl.add(
        scene,
        { opacity: [0, 1], scale: [0.92, 1], filter: ["blur(8px)", "blur(0px)"], duration: DURATION.slow },
        "+=100"
      );
    }
    if (cta) {
      tl.add(cta, { opacity: [0, 1], translateY: [14, 0], scale: [0.96, 1], duration: DURATION.fast }, "-=350");
    }
    if (cue) tl.add(cue, { opacity: [0, 1], duration: DURATION.fast }, "-=150");

    return () => {
      tl.pause();
      splitter.revert();
    };
  }, []);

  return (
    <section
      id="hero"
      ref={heroRef}
      className="relative flex min-h-[100svh] w-full items-center overflow-hidden"
    >
      {/* 3D element — anchored to the right on desktop, full-bleed behind content on mobile */}
      <div ref={sceneRef} className="pointer-events-none absolute inset-0">
        <div className="h-full w-full opacity-70 [mask-image:radial-gradient(ellipse_60%_60%_at_65%_50%,black,transparent)] md:opacity-100">
          <HeroScene />
        </div>
      </div>

      <div className="relative mx-auto flex w-full max-w-6xl flex-col px-6 py-32 sm:px-10">
        <div className="max-w-2xl">
          <span
            ref={eyebrowRef}
            className="block font-mono text-xs tracking-[0.2em] text-brand-2 uppercase"
          >
            {dict.hero.eyebrow}
          </span>

          <h1
            ref={headingRef}
            className="mt-6 text-4xl leading-[1.1] font-semibold tracking-tight text-balance sm:text-5xl md:text-6xl"
          >
            {dict.hero.heading}
          </h1>

          <div ref={subRef} className="group/orb relative mt-6 w-fit">
            {/* Soft white/grey ambient aura — belongs to the orb, drifts on
                its own. Painted first so it sits behind the orb via DOM
                order (no z-index juggling needed). */}
            <motion.div
              aria-hidden
              className="absolute -inset-5 rounded-full bg-white/15 blur-2xl"
              animate={{ opacity: [0.35, 0.6, 0.35], scale: [1, 1.1, 1] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            />

            <motion.div
              // Mirrors the wireframe polyhedron behind it: positive rotation.y
              // in hero-scene.tsx sweeps the shape's front face toward the
              // viewer's right, so this spins the opposite way. A full spin
              // is fine here since it's just an icon, not body text.
              animate={{ rotate: -360 }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            >
              <button
                type="button"
                aria-label={dict.hero.orbAriaLabel}
                className="block cursor-pointer appearance-none rounded-full border-0 bg-transparent p-0"
              >
                <LiquidGlassCard
                  glassSize="sm"
                  className="flex size-16 items-center justify-center rounded-full bg-black/50 p-0"
                >
                  <Sparkles className="size-6 text-white/85" strokeWidth={1.5} />
                </LiquidGlassCard>
              </button>
            </motion.div>

            {/* Hover/focus reveal — deliberately plain: no glass, no aura,
                no motion beyond a simple fade. The visual complexity stays
                on the orb. */}
            <div
              className={[
                "pointer-events-none absolute top-1/2 left-full ml-4 w-72 -translate-y-1/2",
                "opacity-0 transition-opacity duration-200 ease-signature",
                "group-hover/orb:pointer-events-auto group-hover/orb:opacity-100",
                "group-focus-within/orb:pointer-events-auto group-focus-within/orb:opacity-100",
              ].join(" ")}
            >
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="text-sm leading-relaxed text-muted-foreground">{dict.hero.orbTooltip}</p>
              </div>
            </div>
          </div>

          <div ref={ctaRef} className="mt-10 flex flex-wrap items-center gap-6">
            <a
              href="#contact"
              className={cn(
                buttonVariants({ size: "lg" }),
                "group/cta h-11 rounded-full bg-brand px-6 text-brand-foreground",
                "transition-[transform,box-shadow,background-color] duration-300 ease-signature",
                "hover:scale-[1.03] hover:bg-brand/85 hover:shadow-[0_10px_30px_-10px_var(--brand)]",
                "active:scale-[0.98]"
              )}
            >
              {dict.hero.ctaPrimary}
              <ArrowRight className="size-4 transition-transform duration-300 ease-signature group-hover/cta:translate-x-1" />
            </a>
            <a
              href="#capabilities"
              className="group/link inline-flex items-center gap-1 text-sm font-medium text-muted-foreground underline decoration-border underline-offset-4 transition-colors duration-300 ease-signature hover:text-foreground"
            >
              {dict.hero.ctaSecondary}
              <ArrowRight className="size-3.5 transition-transform duration-300 ease-signature group-hover/link:translate-x-1" />
            </a>
          </div>
        </div>
      </div>

      <div
        ref={cueRef}
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 sm:flex"
      >
        <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
          {dict.hero.scrollCue}
        </span>
        <span className="h-8 w-px bg-gradient-to-b from-border to-transparent" />
      </div>
    </section>
  );
}
