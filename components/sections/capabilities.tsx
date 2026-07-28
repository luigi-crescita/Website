"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { MessageSquare, Repeat2, RefreshCw, UserCheck, X, type LucideIcon } from "lucide-react";
import { LiquidGlassCard } from "@/components/kokonutui/liquid-glass-card";
import { useScrollReveal } from "@/lib/use-scroll-reveal";

type Capability = {
  icon: LucideIcon;
  title: string;
  problem: string;
  solution: string;
};

const CAPABILITIES: Capability[] = [
  {
    icon: UserCheck,
    title: "Lead Capture & Qualification",
    problem: "A form fill sits in an inbox for hours before anyone reads it — by then the prospect has already called someone else.",
    solution:
      "Every form submission, DM, or call transcript is parsed and scored against your criteria the moment it arrives, then routed to the right list — no one waits on a human to triage it.",
  },
  {
    icon: MessageSquare,
    title: "AI Chatbots",
    problem: "Visitors land on your site at 11pm with a question, get no answer, and leave.",
    solution:
      "A chatbot trained on your services, pricing, and FAQs holds the conversation, qualifies intent, and books a call straight onto your calendar — responds within seconds, any hour.",
  },
  {
    icon: RefreshCw,
    title: "CRM Automation",
    problem: "Lead data lives across a form tool, an inbox, and a spreadsheet that don't talk to each other, so half of it never makes it into the CRM.",
    solution:
      "New leads, conversation history, and qualification scores sync into your CRM the instant they're captured — no double entry, no record left stale.",
  },
  {
    icon: Repeat2,
    title: "Follow-up Sequencing",
    problem: "A lead goes quiet after one message and nobody circles back until the trail's gone cold.",
    solution:
      "Automated sequences trigger on specific signals — a missed call, an unopened quote, three days of silence — so every lead gets a next touch without anyone having to remember.",
  },
];

function CapabilityOrb({
  capability,
  index,
  onOpen,
}: {
  capability: Capability;
  index: number;
  onOpen: () => void;
}) {
  const Icon = capability.icon;
  const alignEnd = index % 2 === 1;
  const spinDirection = index % 2 === 0 ? -360 : 360;

  return (
    <div className={`flex ${alignEnd ? "md:justify-end" : "md:justify-start"} justify-center`}>
      <div className="group/orb relative">
        {/* Idle pulse at rest, a stronger flare on hover — settles back the
            moment the pointer leaves, independently per orb. */}
        <motion.div
          aria-hidden
          className="absolute -inset-6 rounded-full bg-white/15 blur-2xl"
          animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.08, 1] }}
          whileHover={{ opacity: 0.85, scale: 1.35 }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div
          animate={{ rotate: spinDirection }}
          transition={{ duration: 36, repeat: Infinity, ease: "linear" }}
        >
          <button
            type="button"
            aria-label={`${capability.title} — more detail`}
            onClick={onOpen}
            className="block cursor-pointer appearance-none rounded-full border-0 bg-transparent p-0"
          >
            <LiquidGlassCard
              glassSize="sm"
              className="flex size-24 items-center justify-center rounded-full bg-black/50 p-0"
            >
              <Icon className="size-8 text-white/85" strokeWidth={1.5} />
            </LiquidGlassCard>
          </button>
        </motion.div>

        {/* Hover reveal — plain dark panel, no glass, appears below the orb. */}
        <div
          className={[
            "pointer-events-none absolute top-full left-1/2 z-10 mt-4 w-80 -translate-x-1/2",
            "opacity-0 transition-opacity duration-200 ease-signature",
            "group-hover/orb:pointer-events-auto group-hover/orb:opacity-100",
            "group-focus-within/orb:pointer-events-auto group-focus-within/orb:opacity-100",
          ].join(" ")}
        >
          <div className="rounded-xl border border-border bg-background p-5">
            <h3 className="text-sm font-semibold">{capability.title}</h3>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{capability.problem}</p>
            <p className="mt-2 text-[13px] leading-relaxed text-foreground/90">{capability.solution}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Capabilities() {
  const sectionRef = useRef<HTMLElement>(null);
  const eyebrowRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLElement>(null);
  const orbWrapRefs = useRef<(HTMLElement | null)[]>([]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useScrollReveal(sectionRef, {
    eyebrow: eyebrowRef,
    heading: headingRef,
    items: orbWrapRefs,
  });

  useEffect(() => {
    if (openIndex === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenIndex(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openIndex]);

  const openCapability = openIndex !== null ? CAPABILITIES[openIndex] : null;
  const OpenIcon = openCapability?.icon;

  return (
    <section id="capabilities" ref={sectionRef} className="relative overflow-hidden border-t border-border">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
        src="/videos/Background-3D-motion.mp4"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/75 to-background/90" />

      <div className="relative mx-auto w-full max-w-6xl px-6 py-24 sm:px-10 sm:py-32">
        <div className="max-w-xl">
          <span ref={eyebrowRef} className="block font-mono text-xs tracking-[0.2em] text-brand-2 uppercase">
            What I Build
          </span>
          <h2
            ref={(el) => {
              headingRef.current = el;
            }}
            className="mt-4 text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
          >
            Systems that do the follow-up so you don&apos;t have to.
          </h2>
        </div>

        <div className="mt-20 flex flex-col gap-20 sm:mt-24 sm:gap-24">
          {CAPABILITIES.map((capability, index) => (
            <div
              key={capability.title}
              ref={(el) => {
                orbWrapRefs.current[index] = el;
              }}
            >
              <CapabilityOrb capability={capability} index={index} onOpen={() => setOpenIndex(index)} />
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {openCapability && OpenIcon && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm"
            onClick={() => setOpenIndex(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-md rounded-2xl border border-border bg-background p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                aria-label="Close"
                onClick={() => setOpenIndex(null)}
                className="absolute top-5 right-5 text-muted-foreground transition-colors duration-200 ease-signature hover:text-foreground"
              >
                <X className="size-5" />
              </button>

              <div className="flex size-12 items-center justify-center rounded-lg bg-brand/10 text-brand">
                <OpenIcon className="size-6" strokeWidth={1.75} />
              </div>

              <h3 className="mt-5 text-lg font-semibold tracking-tight">{openCapability.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{openCapability.problem}</p>
              <p className="mt-3 text-[15px] leading-relaxed text-foreground/90">{openCapability.solution}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
