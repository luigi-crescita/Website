"use client";

import { useRef } from "react";
import { useScrollReveal } from "@/lib/use-scroll-reveal";
import { useLanguage } from "@/lib/i18n/language-context";

export function AlwaysRunning() {
  const { dict } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const eyebrowRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLElement>(null);

  useScrollReveal(sectionRef, {
    eyebrow: eyebrowRef,
    heading: headingRef,
  });

  return (
    <section id="always-running" ref={sectionRef} className="border-t border-border">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-6 py-24 text-center sm:px-10 sm:py-32">
        <span ref={eyebrowRef} className="block font-mono text-xs tracking-[0.2em] text-brand-2 uppercase">
          {dict.alwaysRunning.eyebrow}
        </span>
        <h2
          ref={(el) => {
            headingRef.current = el;
          }}
          className="mt-6 text-4xl leading-[1.15] font-semibold tracking-tight text-balance sm:text-5xl md:text-6xl"
        >
          {dict.alwaysRunning.headingLead}
          <span className="text-brand">{dict.alwaysRunning.headingHighlight}</span>
        </h2>
      </div>
    </section>
  );
}
