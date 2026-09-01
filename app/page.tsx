"use client";

import { Hero } from "@/components/sections/hero";
import { Capabilities } from "@/components/sections/capabilities";
import { LeadSourcesIntro } from "@/components/sections/lead-sources-intro";
import { AiQualification } from "@/components/sections/ai-qualification";
import { WarmVideoBackdrop } from "@/components/warm-video-backdrop";
import { FollowUp } from "@/components/sections/follow-up";
import { AlwaysRunning } from "@/components/sections/always-running";
import { Contact } from "@/components/sections/contact";
import { ScrollProgressLine } from "@/components/scroll-progress-line";
import { useLanguage } from "@/lib/i18n/language-context";

export default function Home() {
  const { language } = useLanguage();

  // Keyed by language so switching triggers a full remount instead of a
  // text-only re-render — several sections (Hero, Capabilities, Contact,
  // AlwaysRunning) hand their heading DOM to Anime.js's splitText on mount,
  // which React doesn't know how to reconcile against changed text.
  return (
    <div key={language} className="relative flex flex-1 flex-col">
      <ScrollProgressLine />
      <Hero />
      <Capabilities />
      {/* One shared backdrop spans both — see WarmVideoBackdrop. */}
      <WarmVideoBackdrop>
        <LeadSourcesIntro />
        <AiQualification />
      </WarmVideoBackdrop>
      <FollowUp />
      <AlwaysRunning />
      <Contact />
    </div>
  );
}
