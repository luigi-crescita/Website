import { Hero } from "@/components/sections/hero";
import { Capabilities } from "@/components/sections/capabilities";
import { LeadSourcesIntro } from "@/components/sections/lead-sources-intro";
import { AiQualification } from "@/components/sections/ai-qualification";
import { FollowUp } from "@/components/sections/follow-up";
import { AlwaysRunning } from "@/components/sections/always-running";
import { Contact } from "@/components/sections/contact";
import { ScrollProgressLine } from "@/components/scroll-progress-line";

export default function Home() {
  return (
    <div className="relative flex flex-1 flex-col">
      <ScrollProgressLine />
      <Hero />
      <Capabilities />
      <LeadSourcesIntro />
      <AiQualification />
      <FollowUp />
      <AlwaysRunning />
      <Contact />
    </div>
  );
}
