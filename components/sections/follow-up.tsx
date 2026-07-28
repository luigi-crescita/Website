"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useLanguage } from "@/lib/i18n/language-context";

type ChatMessage = {
  sender: "lead" | "ai";
  text: string;
  time: string;
};

// Message 1 is the same lead carried over from the AI Qualification
// table's fully-ticked WhatsApp row (urgent, warm, first-time, wants a
// scheduled appointment) — this conversation is that lead following through.
// Text/time content comes from dict.followUp.messages/times; only the
// sender (bubble side/color) is structural and lives here.
const SENDERS: ChatMessage["sender"][] = ["lead", "ai", "lead", "ai"];

// Scroll-progress choreography (fractions of this section's own pinned
// range) — header appears, then each message slides up on its own step with
// comfortable reading room between, a brief "typing" beat before the AI's
// reply, and a date divider marking the jump to the next day before the
// final message.
const HEADER_END = 0.04;
const TODAY_DIVIDER_END = 0.04;

const MSG_STEPS = [
  { start: 0.05, end: 0.12 },
  { start: 0.34, end: 0.4 },
  { start: 0.5, end: 0.56 },
  { start: 0.76, end: 0.82 },
];

const THINKING_IN_START = 0.22;
const THINKING_IN_END = 0.28;
const THINKING_OUT_START = 0.32;
const THINKING_OUT_END = 0.36;

const TOMORROW_DIVIDER_START = 0.68;
const TOMORROW_DIVIDER_END = 0.74;

const FADE_OUT_START = 0.94;
const FADE_OUT_END = 1;

function DateDivider({
  label,
  progress,
  start,
  end,
}: {
  label: string;
  progress: MotionValue<number>;
  start: number;
  end: number;
}) {
  const opacity = useTransform(progress, [start, end], [0, 1]);
  return (
    <motion.div style={{ opacity }} className="my-1 flex justify-center">
      <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-medium text-muted-foreground">
        {label}
      </span>
    </motion.div>
  );
}

function Bubble({
  message,
  progress,
  start,
  end,
}: {
  message: ChatMessage;
  progress: MotionValue<number>;
  start: number;
  end: number;
}) {
  const opacity = useTransform(progress, [start, end], [0, 1]);
  const y = useTransform(progress, [start, end], [16, 0]);
  const isAi = message.sender === "ai";

  return (
    <motion.div style={{ opacity, y }} className={`flex flex-col ${isAi ? "items-end" : "items-start"}`}>
      <div
        className={[
          "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isAi ? "rounded-br-sm bg-[#25D366]/90 text-white" : "rounded-bl-sm bg-white/10 text-foreground/90",
        ].join(" ")}
      >
        {message.text}
      </div>
      <span className="mt-1 px-1 text-[10px] text-muted-foreground">{message.time}</span>
    </motion.div>
  );
}

function TypingIndicator({ progress }: { progress: MotionValue<number> }) {
  const opacity = useTransform(
    progress,
    [THINKING_IN_START, THINKING_IN_END, THINKING_OUT_START, THINKING_OUT_END],
    [0, 1, 1, 0]
  );

  return (
    <motion.div style={{ opacity }} className="absolute inset-0 flex items-center justify-end">
      <div className="flex items-center gap-1 rounded-2xl rounded-br-sm bg-[#25D366]/90 px-4 py-3">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
            className="size-1.5 rounded-full bg-white"
          />
        ))}
      </div>
    </motion.div>
  );
}

export function FollowUp() {
  const { dict } = useLanguage();
  const MESSAGES: ChatMessage[] = SENDERS.map((sender, i) => ({
    sender,
    text: dict.followUp.messages[i],
    time: dict.followUp.times[i],
  }));
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const frameOpacity = useTransform(
    scrollYProgress,
    [0, HEADER_END, FADE_OUT_START, FADE_OUT_END],
    [0, 1, 1, 0]
  );

  const introText = (
    <div className="lg:w-72 lg:shrink-0">
      <span className="block font-mono text-xs tracking-[0.2em] text-brand-2 uppercase">{dict.followUp.eyebrow}</span>
      <p className="mt-4 text-xl leading-snug font-medium text-balance text-foreground/90 sm:text-2xl">
        {dict.followUp.intro}
      </p>
    </div>
  );

  const chatWindow = (
    <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-background lg:mx-0">
      <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3">
        <Image
          src="/images/whatsapp-business.png"
          alt=""
          aria-hidden
          width={60}
          height={60}
          className="rounded-full"
        />
        <div>
          <p className="text-sm font-semibold">{dict.followUp.chatTitle}</p>
          <p className="text-[11px] text-muted-foreground">{dict.followUp.chatSubtitle}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 px-4 py-5">
        <DateDivider label={dict.followUp.today} progress={scrollYProgress} start={0} end={TODAY_DIVIDER_END} />
        <Bubble message={MESSAGES[0]} progress={scrollYProgress} start={MSG_STEPS[0].start} end={MSG_STEPS[0].end} />
        {/* Typing indicator overlays the same slot as message 2 — it fades
            out right as the reply fades in, a crossfade rather than its own
            reserved space (which would leave a gap once it's done). */}
        <div className="relative">
          <TypingIndicator progress={scrollYProgress} />
          <Bubble message={MESSAGES[1]} progress={scrollYProgress} start={MSG_STEPS[1].start} end={MSG_STEPS[1].end} />
        </div>
        <Bubble message={MESSAGES[2]} progress={scrollYProgress} start={MSG_STEPS[2].start} end={MSG_STEPS[2].end} />
        <DateDivider
          label={dict.followUp.tomorrow}
          progress={scrollYProgress}
          start={TOMORROW_DIVIDER_START}
          end={TOMORROW_DIVIDER_END}
        />
        <Bubble message={MESSAGES[3]} progress={scrollYProgress} start={MSG_STEPS[3].start} end={MSG_STEPS[3].end} />
      </div>
    </div>
  );

  if (reducedMotion) {
    return (
      <section id="follow-up" className="relative border-t border-border py-24 sm:py-32">
        {/* lg:pr-32 keeps this content clear of the fixed scroll-progress
            line, which occupies a strip at the far right edge from lg up. */}
        <div className="mx-auto w-full max-w-6xl px-6 sm:px-10 lg:pr-32">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
            {introText}
            <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-background lg:mx-0">
              <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3">
                <Image src="/images/whatsapp-business.png" alt="" aria-hidden width={60} height={60} className="rounded-full" />
                <div>
                  <p className="text-sm font-semibold">{dict.followUp.chatTitle}</p>
                  <p className="text-[11px] text-muted-foreground">{dict.followUp.chatSubtitle}</p>
                </div>
              </div>
              <div className="flex flex-col gap-3 px-4 py-5">
                <div className="my-1 flex justify-center">
                  <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-medium text-muted-foreground">
                    {dict.followUp.today}
                  </span>
                </div>
                {MESSAGES.slice(0, 3).map((m, i) => (
                  <div key={i} className={`flex flex-col ${m.sender === "ai" ? "items-end" : "items-start"}`}>
                    <div
                      className={[
                        "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                        m.sender === "ai"
                          ? "rounded-br-sm bg-[#25D366]/90 text-white"
                          : "rounded-bl-sm bg-white/10 text-foreground/90",
                      ].join(" ")}
                    >
                      {m.text}
                    </div>
                    <span className="mt-1 px-1 text-[10px] text-muted-foreground">{m.time}</span>
                  </div>
                ))}
                <div className="my-1 flex justify-center">
                  <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-medium text-muted-foreground">
                    {dict.followUp.tomorrow}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <div className="max-w-[75%] rounded-2xl rounded-br-sm bg-[#25D366]/90 px-4 py-2.5 text-sm leading-relaxed text-white">
                    {MESSAGES[3].text}
                  </div>
                  <span className="mt-1 px-1 text-[10px] text-muted-foreground">{MESSAGES[3].time}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="follow-up" ref={sectionRef} className="relative h-[440vh]">
      <div className="sticky top-0 flex h-screen w-full items-center overflow-hidden border-t border-border">
        {/* lg:pr-32 keeps this content clear of the fixed scroll-progress
            line, which occupies a strip at the far right edge from lg up. */}
        <motion.div style={{ opacity: frameOpacity }} className="mx-auto w-full max-w-6xl px-6 sm:px-10 lg:pr-32">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
            {introText}
            {chatWindow}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
