export type Locale = "it" | "en";

export const defaultLocale: Locale = "it";

export type Dictionary = {
  meta: {
    title: string;
    description: string;
  };
  languageSwitcher: {
    ariaLabel: string;
  };
  hero: {
    eyebrow: string;
    heading: string;
    orbAriaLabel: string;
    orbTooltip: string;
    ctaPrimary: string;
    ctaSecondary: string;
    scrollCue: string;
  };
  capabilities: {
    eyebrow: string;
    heading: string;
    closeAriaLabel: string;
    moreDetailSuffix: string;
    items: { title: string; problem: string; solution: string }[];
  };
  leadSourcesIntro: {
    eyebrow: string;
    heading: string;
    andMore: string;
    sourceNames: string[];
  };
  aiQualification: {
    eyebrow: string;
    intro: string;
    thinking: string;
    criteria: string[];
    platformNames: string[];
  };
  followUp: {
    eyebrow: string;
    intro: string;
    chatTitle: string;
    chatSubtitle: string;
    today: string;
    tomorrow: string;
    messages: string[];
    times: string[];
  };
  alwaysRunning: {
    eyebrow: string;
    headingLead: string;
    headingHighlight: string;
  };
  contact: {
    eyebrow: string;
    heading: string;
    paragraph: string;
    cta: string;
  };
};

const it: Dictionary = {
  meta: {
    title: "Crescita Estetica — Automazione AI per Attività in Crescita",
    description:
      "Automazione dei lead, chatbot e integrazione CRM basati su AI che trasformano il follow-up manuale in fatturato automatico.",
  },
  languageSwitcher: {
    ariaLabel: "Seleziona la lingua",
  },
  hero: {
    eyebrow: "Automazione AI, Applicata",
    heading: "Automatizza il lavoro tra un lead e un cliente.",
    orbAriaLabel: "Cosa costruisco, spiegato",
    orbTooltip:
      "Progetto sistemi basati su AI — acquisizione lead, qualificazione, sincronizzazione CRM — che trasformano il follow-up manuale in fatturato automatico.",
    ctaPrimary: "Contattami",
    ctaSecondary: "Scopri cosa fanno questi sistemi",
    scrollCue: "Scorri",
  },
  capabilities: {
    eyebrow: "Cosa Costruisco",
    heading: "Sistemi che si occupano del follow-up, così non devi farlo tu.",
    closeAriaLabel: "Chiudi",
    moreDetailSuffix: "più dettagli",
    items: [
      {
        title: "Acquisizione e Qualificazione Lead",
        problem:
          "Una richiesta compilata resta ore in una casella di posta prima che qualcuno la legga — nel frattempo il potenziale cliente ha già chiamato qualcun altro.",
        solution:
          "Ogni modulo compilato, DM o trascrizione di chiamata viene analizzato e valutato secondo i tuoi criteri nel momento in cui arriva, poi indirizzato alla lista giusta — nessuno aspetta che una persona lo smisti manualmente.",
      },
      {
        title: "Chatbot AI",
        problem: "I visitatori arrivano sul tuo sito alle 23 con una domanda, non ricevono risposta e se ne vanno.",
        solution:
          "Un chatbot addestrato sui tuoi servizi, prezzi e domande frequenti sostiene la conversazione, valuta l'interesse e prenota una chiamata direttamente sul tuo calendario — risponde in pochi secondi, a qualsiasi ora.",
      },
      {
        title: "Automazione CRM",
        problem:
          "I dati dei lead sono sparsi tra un tool per i moduli, una casella di posta e un foglio di calcolo che non comunicano tra loro, così metà di essi non finisce mai nel CRM.",
        solution:
          "Nuovi lead, storico delle conversazioni e punteggi di qualificazione si sincronizzano nel tuo CRM nell'istante in cui vengono acquisiti — nessuna doppia registrazione, nessun record lasciato indietro.",
      },
      {
        title: "Sequenze di Follow-up",
        problem: "Un lead smette di rispondere dopo un messaggio e nessuno lo richiama finché la pista non si è già raffreddata.",
        solution:
          "Sequenze automatiche si attivano in base a segnali precisi — una chiamata persa, un preventivo non aperto, tre giorni di silenzio — così ogni lead riceve un nuovo contatto senza che nessuno debba ricordarselo.",
      },
    ],
  },
  leadSourcesIntro: {
    eyebrow: "Come Funziona",
    heading: "I lead arrivano da ovunque.",
    andMore: "e molto altro...",
    sourceNames: [
      "Email",
      "DM Instagram",
      "Messaggio Facebook",
      "Modulo dal Sito",
      "DM TikTok",
      "Messaggio Slack",
      "Lead da Meta",
      "Lead da Google Ads",
      "Messaggio WhatsApp",
      "Modulo Compilato",
      "Vendita Shopify",
      "Messaggio Telegram",
    ],
  },
  aiQualification: {
    eyebrow: "Qualificazione",
    intro:
      "L'AI legge ogni richiesta in arrivo confrontandola con i tuoi criteri personalizzati e segnala chi richiede attenzione prima — etichettando automaticamente i lead più prioritari come “urgenti”.",
    thinking: "Sto pensando",
    criteria: ["Urgente", "Caldo", "Prima Volta", "Appuntamento Fissato"],
    platformNames: ["Email", "DM Instagram", "Messaggio Facebook", "Messaggio WhatsApp", "Lead da Google Ads", "Messaggio Telegram"],
  },
  followUp: {
    eyebrow: "Follow-up",
    intro:
      "L'AI gestisce l'intera conversazione con il lead — qualificazione, prenotazione, follow-up — senza che nessuno debba leggere un solo messaggio. Costruito su misura, non un chatbot generico.",
    chatTitle: "Lead WhatsApp",
    chatSubtitle: "Follow-up automatico",
    today: "Oggi",
    tomorrow: "Domani",
    messages: [
      "Ciao! Ho visto la vostra pagina e mi piacerebbe prenotare un appuntamento — c'è disponibilità questa settimana? Sarebbe la mia prima volta!",
      "Grazie per averci contattato! Abbiamo disponibilità domani alle 15:00 per un appuntamento — va bene per te?",
      "Perfetto, ci vediamo domani alle 15!",
      "Grazie per essere passato oggi! Facci sapere se hai bisogno di altro.",
    ],
    times: ["10:00", "10:05", "10:07", "16:00"],
  },
  alwaysRunning: {
    eyebrow: "Sempre Attivo",
    headingLead: "Funziona 24 ore su 24. Tu non guardi i passaggi — ",
    headingHighlight: "solo i risultati.",
  },
  contact: {
    eyebrow: "Contattami",
    heading: "Parliamo di cosa ti serve.",
    paragraph: "Niente moduli, niente funnel — scrivimi un messaggio e ti risponderò direttamente.",
    cta: "Invia un messaggio",
  },
};

const en: Dictionary = {
  meta: {
    title: "Crescita Estetica — AI Automation for Growth-Focused Businesses",
    description:
      "AI-powered lead automation, chatbots, and CRM integration that turn manual follow-up into revenue on autopilot.",
  },
  languageSwitcher: {
    ariaLabel: "Select language",
  },
  hero: {
    eyebrow: "AI Automation, Applied",
    heading: "Automate the work between a lead and a client.",
    orbAriaLabel: "What I build, explained",
    orbTooltip:
      "I design AI-powered systems — lead capture, qualification, CRM sync — that turn manual follow-up into revenue on autopilot.",
    ctaPrimary: "Get in touch",
    ctaSecondary: "See what these systems do",
    scrollCue: "Scroll",
  },
  capabilities: {
    eyebrow: "What I Build",
    heading: "Systems that do the follow-up so you don't have to.",
    closeAriaLabel: "Close",
    moreDetailSuffix: "more detail",
    items: [
      {
        title: "Lead Capture & Qualification",
        problem:
          "A form fill sits in an inbox for hours before anyone reads it — by then the prospect has already called someone else.",
        solution:
          "Every form submission, DM, or call transcript is parsed and scored against your criteria the moment it arrives, then routed to the right list — no one waits on a human to triage it.",
      },
      {
        title: "AI Chatbots",
        problem: "Visitors land on your site at 11pm with a question, get no answer, and leave.",
        solution:
          "A chatbot trained on your services, pricing, and FAQs holds the conversation, qualifies intent, and books a call straight onto your calendar — responds within seconds, any hour.",
      },
      {
        title: "CRM Automation",
        problem:
          "Lead data lives across a form tool, an inbox, and a spreadsheet that don't talk to each other, so half of it never makes it into the CRM.",
        solution:
          "New leads, conversation history, and qualification scores sync into your CRM the instant they're captured — no double entry, no record left stale.",
      },
      {
        title: "Follow-up Sequencing",
        problem: "A lead goes quiet after one message and nobody circles back until the trail's gone cold.",
        solution:
          "Automated sequences trigger on specific signals — a missed call, an unopened quote, three days of silence — so every lead gets a next touch without anyone having to remember.",
      },
    ],
  },
  leadSourcesIntro: {
    eyebrow: "How It Works",
    heading: "Leads arrive from everywhere.",
    andMore: "and more...",
    sourceNames: [
      "Email",
      "Instagram DM",
      "Facebook Message",
      "Website Form",
      "TikTok DM",
      "Slack Message",
      "Meta Lead",
      "Google Ads Lead",
      "WhatsApp Message",
      "Form Submission",
      "Shopify Sale",
      "Telegram Message",
    ],
  },
  aiQualification: {
    eyebrow: "Qualification",
    intro:
      "AI reads every incoming request against your custom criteria and flags who needs attention first — tagging the highest-priority leads as “urgent” automatically.",
    thinking: "Thinking",
    criteria: ["Urgent", "Warm", "First Time", "Scheduled Appointment"],
    platformNames: ["Email", "Instagram DM", "Facebook Message", "WhatsApp Message", "Google Ads Lead", "Telegram Message"],
  },
  followUp: {
    eyebrow: "Follow-Up",
    intro:
      "AI handles the entire conversation with the lead — qualifying, scheduling, following up — without anyone needing to read a single message. Fully custom-built, not a generic chatbot.",
    chatTitle: "WhatsApp Lead",
    chatSubtitle: "Automated follow-up",
    today: "Today",
    tomorrow: "Tomorrow",
    messages: [
      "Hi! I saw your page and I'd love to book an appointment — is there any availability this week? This would be my first time coming in!",
      "Thanks for reaching out! We have availability tomorrow at 3:00 PM for an appointment — does that work for you?",
      "Perfect, see you tomorrow at 3!",
      "Thanks for stopping by today! Let us know if you need anything else.",
    ],
    times: ["10:00 AM", "10:05 AM", "10:07 AM", "4:00 PM"],
  },
  alwaysRunning: {
    eyebrow: "Always Running",
    headingLead: "It runs around the clock. You don't watch the steps — ",
    headingHighlight: "just the results.",
  },
  contact: {
    eyebrow: "Get In Touch",
    heading: "Let's talk about what you need.",
    paragraph: "No forms, no funnels — send a message and I'll reply directly.",
    cta: "Send a message",
  },
};

export const dictionaries: Record<Locale, Dictionary> = { it, en };
