"use client";

import { useRef } from "react";
import { ArrowUpRight, Mail } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useScrollReveal } from "@/lib/use-scroll-reveal";

const EMAIL = "luigi@crescitaestetica.it";

const SOCIAL_LINKS = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/luigi-longobardo-829a2a404" },
  { label: "Instagram", href: "https://www.instagram.com/luigi.crescita/" },
];

export function Contact() {
  const sectionRef = useRef<HTMLElement>(null);
  const eyebrowRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLElement>(null);
  const paragraphRef = useRef<HTMLElement>(null);
  // Index 0 = CTA group, index 1 = social links row.
  const itemRefs = useRef<(HTMLElement | null)[]>([]);

  useScrollReveal(sectionRef, {
    eyebrow: eyebrowRef,
    heading: headingRef,
    paragraph: paragraphRef,
    items: itemRefs,
  });

  return (
    <section id="contact" ref={sectionRef} className="border-t border-border">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-6 py-24 text-center sm:px-10 sm:py-32">
        <span ref={eyebrowRef} className="block font-mono text-xs tracking-[0.2em] text-brand-2 uppercase">
          Get In Touch
        </span>

        <h2
          ref={(el) => {
            headingRef.current = el;
          }}
          className="mt-4 max-w-xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
        >
          Let&apos;s talk about what you need.
        </h2>

        <p
          ref={(el) => {
            paragraphRef.current = el;
          }}
          className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground"
        >
          No forms, no funnels — send a message and I&apos;ll reply directly.
        </p>

        <div
          ref={(el) => {
            itemRefs.current[0] = el;
          }}
          className="mt-10 flex flex-col items-center gap-4"
        >
          <a
            href={`mailto:${EMAIL}`}
            className={cn(
              buttonVariants({ size: "lg" }),
              "group/cta h-11 rounded-full bg-brand px-6 text-brand-foreground",
              "transition-[transform,box-shadow,background-color] duration-300 ease-signature",
              "hover:scale-[1.03] hover:bg-brand/85 hover:shadow-[0_10px_30px_-10px_var(--brand)]",
              "active:scale-[0.98]"
            )}
          >
            <Mail className="size-4 transition-transform duration-300 ease-signature group-hover/cta:-translate-y-0.5" />
            Send a message
          </a>
          <span className="font-mono text-sm text-muted-foreground">{EMAIL}</span>
        </div>

        <div
          ref={(el) => {
            itemRefs.current[1] = el;
          }}
          className="mt-14 flex items-center gap-6 border-t border-border pt-8"
        >
          {SOCIAL_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group/link flex items-center gap-1 text-sm text-muted-foreground transition-colors duration-300 ease-signature hover:text-foreground"
            >
              {link.label}
              <ArrowUpRight className="size-3.5 transition-transform duration-300 ease-signature group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
