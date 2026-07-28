"use client";

import { useEffect, useRef, type RefObject } from "react";
import { useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { splitWords } from "./text-reveal";

type ScrollRevealRefs = {
  eyebrow?: RefObject<HTMLElement | null>;
  heading?: RefObject<HTMLElement | null>;
  paragraph?: RefObject<HTMLElement | null>;
  /** A single ref holding an array — cards / node wrappers / CTA groups. */
  items?: RefObject<(HTMLElement | null)[]>;
};

function windowProgress(p: number, start: number, span: number) {
  return Math.min(1, Math.max(0, (p - start) / span));
}

function applyFade(el: HTMLElement | null | undefined, local: number, distance: number) {
  if (!el) return;
  el.style.opacity = String(local);
  el.style.transform = `translateY(${(1 - local) * distance}px)`;
}

/**
 * Ties every element's visibility directly to scroll position — no timers,
 * no "trigger once and play a fixed-duration timeline". Scrolling slowly,
 * quickly, or stopping mid-transition always reflects the exact current
 * scroll percentage; scrolling back up reverses it, because the value IS
 * the scroll position, not a clock started by it.
 *
 * Takes ref objects (not `.current` values) — refs are only ever read
 * inside the effect / scroll callback below, never during render.
 */
export function useScrollReveal(sectionRef: RefObject<HTMLElement | null>, refs: ScrollRevealRefs) {
  const reducedMotion = useReducedMotion();
  const wordsRef = useRef<HTMLElement[]>([]);
  const splitterRef = useRef<{ revert: () => void } | null>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 92%", "start 40%"],
  });

  const apply = (raw: number) => {
    const p = reducedMotion ? 1 : raw;

    applyFade(refs.eyebrow?.current, windowProgress(p, 0, 0.35), 16);

    const words = wordsRef.current;
    const wordSpan = 0.4;
    words.forEach((el, i) => {
      const local = windowProgress(p, i * (wordSpan / Math.max(words.length, 1)), wordSpan);
      el.style.opacity = String(local);
      el.style.transform = `translateY(${(1 - local) * 14}px)`;
      el.style.filter = `blur(${(1 - local) * 5}px)`;
    });

    applyFade(refs.paragraph?.current, windowProgress(p, 0.35, 0.35), 16);

    (refs.items?.current ?? []).forEach((el, i) => {
      if (!el) return;
      const local = windowProgress(p, 0.4 + i * 0.09, 0.35);
      el.style.opacity = String(local);
      el.style.transform = `translateY(${(1 - local) * 26}px) scale(${0.96 + local * 0.04})`;
    });
  };

  useEffect(() => {
    const heading = refs.heading?.current;
    if (heading) {
      const { splitter, words } = splitWords(heading);
      wordsRef.current = words;
      splitterRef.current = splitter;
    }
    // `useMotionValueEvent` below only fires on subsequent changes — without
    // this, a section already below the fold at mount would render fully
    // visible (no inline style yet) until the user scrolls at all.
    apply(scrollYProgress.get());
    return () => {
      splitterRef.current?.revert();
      wordsRef.current = [];
    };
    // Re-split only if the heading ref object identity changes (it won't).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refs.heading]);

  useMotionValueEvent(scrollYProgress, "change", apply);
}
