/* ==========================================================================
   ORBITECH — CONTENT CONFIGURATION
   ==========================================================================

   ⚠️  THIS IS THE ONLY FILE YOU NEED TO EDIT TO SWAP IN REAL CONTENT.

   Every number, card, bio, language and label rendered on the page comes
   from the ORBITECH object below. Nothing here affects layout — change the
   values, and the page rebuilds itself around them.

   Anything marked  // 🔴 PLACEHOLDER  is invented sample data. Replace it.
   Anything marked  // ⚙️  CONFIG      is a real setting you must configure.

   See CONTENT-GUIDE.md for a field-by-field map.
   ========================================================================== */

const ORBITECH = {

  /* ======================================================================
     ⚙️  1. INTEGRATIONS — real settings, not placeholders
     ====================================================================== */
  integrations: {

    /* ⚙️ CONFIG — Google Apps Script Web App URL for the "Join Our Team"
       application form. Until this is replaced, the form runs in DEMO MODE:
       it validates and shows a success state but does not send anything.

       Get this URL by following backend/SETUP-GOOGLE-APPS-SCRIPT.md
       It looks like:
       https://script.google.com/macros/s/AKfycbx.....D2/exec               */
    GOOGLE_SCRIPT_URL: "REPLACE_ME",

    /* ⚙️ CONFIG — Endpoint for the client Contact form. You can point this at
       the SAME Apps Script URL (Code.gs routes on the `formType` field and
       writes client inquiries to a second sheet tab), or at a different
       service entirely. Leave as "REPLACE_ME" to keep it in demo mode.     */
    CONTACT_ENDPOINT: "REPLACE_ME",

    /* ⚙️ CONFIG — Max CV upload size. Apps Script can accept roughly 45 MB in
       a single request; 8 MB is a sane limit for a CV and keeps the base64
       payload small enough to upload quickly on a poor connection.         */
    maxUploadMB: 8,
    acceptedUploadTypes: ".pdf,.doc,.docx,.rtf,.odt,.txt"
  },


  /* ======================================================================
     🔴 2. COMPANY — basics used in the footer, contact block and SEO
     ====================================================================== */
  company: {
    name: "Orbitech",
    // 🔴 PLACEHOLDER — one-line descriptor, also used as the meta description base
    descriptor: "Multilingual data solutions and software engineering, under one roof.",
    email: "hello@orbitech.example",              // 🔴 PLACEHOLDER
    salesEmail: "projects@orbitech.example",      // 🔴 PLACEHOLDER
    talentEmail: "talent@orbitech.example",       // 🔴 PLACEHOLDER
    phone: "+00 0000 000000",                     // 🔴 PLACEHOLDER
    location: "Remote-first · Operating across 20+ time zones", // 🔴 PLACEHOLDER
    responseTime: "We reply to project enquiries within 1 business day", // 🔴 PLACEHOLDER
    foundedYear: 2019,                            // 🔴 PLACEHOLDER

    // 🔴 PLACEHOLDER — replace `url` with real profiles. Remove any you don't use.
    socials: [
      { label: "LinkedIn", url: "#", icon: "linkedin" },
      { label: "X",        url: "#", icon: "x" },
      { label: "GitHub",   url: "#", icon: "github" },
      { label: "Email",    url: "mailto:hello@orbitech.example", icon: "mail" }
    ]
  },


  /* ======================================================================
     3. NAVIGATION — labels are deliberately conventional and scannable.
        Keep the playful orbit language for section headers, not here.
     ====================================================================== */
  nav: [
    { label: "Solutions", href: "#solutions" },
    { label: "Work",      href: "#work" },
    { label: "Team",      href: "#team" },
    { label: "Join Us",   href: "#join" },
    { label: "Contact",   href: "#contact" }
  ],


  /* ======================================================================
     🔴 4. DATA SOLUTIONS PILLAR
     ====================================================================== */
  dataSolutions: {

    /* Credibility metrics for this pillar: network scale, language breadth,
       and quality — deliberately NOT in-house headcount. */
    stats: [
      {
        value: "500+",                                     // 🔴 PLACEHOLDER
        label: "Vetted specialists",
        note: "Annotators, linguists and reviewers in our active network"
      },
      {
        value: "100+",                                     // 🔴 PLACEHOLDER
        label: "Languages supported",
        note: "From high-volume majors to low-resource and regional variants"
      },
      {
        value: "98.4%",                                    // 🔴 PLACEHOLDER
        label: "Average acceptance rate",
        note: "Units accepted on first client review, trailing 12 months"
      },
      {
        value: "12M+",                                     // 🔴 PLACEHOLDER
        label: "Units delivered",
        note: "Annotated, transcribed and post-edited across all projects"
      }
    ],

    // 🔴 PLACEHOLDER — service copy. `icon` maps to a key in ICONS (app.js).
    services: [
      {
        icon: "annotate",
        title: "Data annotation",
        desc: "Image, video, text and audio labelling for training and evaluation sets — bounding boxes, segmentation, NER, intent, sentiment, RLHF preference ranking.",
        meta: "Image · Video · Text · Audio"
      },
      {
        icon: "transcribe",
        title: "Transcription",
        desc: "Verbatim and clean-read transcription with speaker diarisation, timestamping and domain-specific terminology handling.",
        meta: "Verbatim · Clean-read · Timecoded"
      },
      {
        icon: "translate",
        title: "Translation & localisation",
        desc: "Human translation and full localisation, including UI strings, documentation and marketing copy, delivered with in-locale review.",
        meta: "Human-first · In-locale review"
      },
      {
        icon: "mtpe",
        title: "MTPE",
        desc: "Machine translation post-editing at light or full depth, tuned to your quality bar and turnaround, with per-engine performance reporting.",
        meta: "Light & full post-edit"
      },
      {
        icon: "collect",
        title: "Data collection",
        desc: "Sourced speech, image and text datasets collected to spec — demographics, accents, devices and environments defined up front.",
        meta: "Speech · Image · Text"
      },
      {
        icon: "qa",
        title: "Quality assurance",
        desc: "Independent second-pass review, inter-annotator agreement scoring and a sampling regime sized to your acceptance threshold.",
        meta: "IAA scoring · Sampling QA"
      }
    ],

    /* 🔴 PLACEHOLDER — language coverage. Grouped for scannability.
       Add or remove groups freely; the layout adapts. */
    languageGroups: [
      {
        label: "High-volume",
        languages: ["English", "Mandarin Chinese", "Spanish", "Hindi", "Arabic",
                    "Portuguese", "Bengali", "Russian", "Japanese", "French",
                    "German", "Indonesian"]
      },
      {
        label: "European",
        languages: ["Italian", "Dutch", "Polish", "Czech", "Swedish", "Danish",
                    "Norwegian", "Finnish", "Greek", "Hungarian", "Romanian",
                    "Ukrainian", "Bulgarian", "Croatian", "Slovak"]
      },
      {
        label: "Asia-Pacific",
        languages: ["Korean", "Vietnamese", "Thai", "Tagalog", "Malay", "Urdu",
                    "Tamil", "Telugu", "Marathi", "Punjabi", "Nepali",
                    "Sinhala", "Khmer", "Burmese"]
      },
      {
        label: "Middle East & Africa",
        languages: ["Hebrew", "Turkish", "Farsi", "Pashto", "Swahili", "Amharic",
                    "Hausa", "Yoruba", "Zulu", "Afrikaans", "Somali"]
      }
    ],

    // 🔴 PLACEHOLDER — shown beside the language list
    languageNote: "Coverage extends well beyond this list, including low-resource and regional variants. If you don't see your language, ask — we can usually source it.",

    /* 🔴 PLACEHOLDER — Featured work.
       ── The card component handles BOTH formats: ──────────────────────────
       NAMED client     → set  client: { name: "Acme Corp", sector: "..." }
       ANONYMISED client→ set  client: { descriptor: "Fortune 500 e-commerce
                                          client", sector: "..." }
       Supply one or the other. Never both. Everything else is identical.  */
    featuredWork: [
      {
        client: { descriptor: "Fortune 500 e-commerce client", sector: "Retail / Search" },
        title: "Product catalogue annotation at scale",
        summary: "Multi-attribute labelling of a global product catalogue to train a visual search and recommendation model, run across four languages with a rolling weekly delivery cadence.",
        tags: ["Image annotation", "Taxonomy", "4 languages"],
        metrics: [
          { value: "2M",    label: "Units annotated" },
          { value: "98%",   label: "Acceptance rate" },
          { value: "11 wk", label: "End to end" }
        ]
      },
      {
        client: { name: "Northwind Speech Labs", sector: "Conversational AI" },
        title: "Low-resource ASR training corpus",
        summary: "Sourced, transcribed and quality-checked a speech corpus in nine under-served languages, including dialect tagging and speaker demographic balancing.",
        tags: ["Transcription", "Data collection", "9 languages"],
        metrics: [
          { value: "4,200 h", label: "Audio transcribed" },
          { value: "9",       label: "Languages" },
          { value: "99.1%",   label: "Acceptance rate" }
        ]
      },
      {
        client: { descriptor: "European fintech scale-up", sector: "Financial services" },
        title: "Regulated content localisation programme",
        summary: "Ongoing MTPE and in-locale legal review for customer-facing product content across 14 EU markets, with a terminology base maintained jointly with their compliance team.",
        tags: ["MTPE", "Localisation", "14 markets"],
        metrics: [
          { value: "1.8M", label: "Words post-edited" },
          { value: "14",   label: "Markets live" },
          { value: "48 h", label: "Standard turnaround" }
        ]
      },
      {
        client: { descriptor: "Frontier AI research lab", sector: "AI / Alignment" },
        title: "Multilingual RLHF preference dataset",
        summary: "Recruited and trained a specialist annotator cohort to produce preference rankings and written critiques for model output evaluation, with a double-blind review layer.",
        tags: ["RLHF", "Preference ranking", "Expert cohort"],
        metrics: [
          { value: "310k", label: "Comparisons" },
          { value: "0.84", label: "Inter-annotator κ" },
          { value: "22",   label: "Languages" }
        ]
      }
    ]
  },


  /* ======================================================================
     🔴 5. SOFTWARE DEVELOPMENT PILLAR
     ====================================================================== */
  software: {

    stats: [
      {
        value: "24",                                       // 🔴 PLACEHOLDER
        label: "In-house engineers",
        note: "Full-time product, platform and ML engineers — not subcontracted"
      },
      {
        value: "7",                                        // 🔴 PLACEHOLDER
        label: "Years active",
        note: "Shipping production software since 2019"
      },
      {
        value: "96%",                                      // 🔴 PLACEHOLDER
        label: "Client satisfaction",
        note: "Post-engagement survey score across completed projects"
      },
      {
        value: "40+",                                      // 🔴 PLACEHOLDER
        label: "Projects delivered",
        note: "From focused integrations to multi-year platform builds"
      }
    ],

    // 🔴 PLACEHOLDER
    services: [
      {
        icon: "web",
        title: "Custom web applications",
        desc: "Product and internal-tooling builds from scoping through to launch — dashboards, portals, marketplaces and the APIs behind them.",
        meta: "Product · Internal tools · APIs"
      },
      {
        icon: "mobile",
        title: "Mobile development",
        desc: "Cross-platform and native mobile apps, built to ship on both stores from a single well-tested codebase.",
        meta: "iOS · Android · Cross-platform"
      },
      {
        icon: "ai",
        title: "AI & ML engineering",
        desc: "Model integration, RAG and retrieval systems, evaluation harnesses and inference infrastructure — production-grade, not notebooks.",
        meta: "LLM · RAG · Evaluation"
      },
      {
        icon: "pipeline",
        title: "Data platform engineering",
        desc: "Ingestion, transformation and annotation pipelines built to feed models reliably, with lineage and quality gates baked in.",
        meta: "ETL · Pipelines · Lineage"
      },
      {
        icon: "cloud",
        title: "Cloud & DevOps",
        desc: "Infrastructure as code, CI/CD, observability and cost optimisation — so what we build stays cheap and boring to operate.",
        meta: "IaC · CI/CD · Observability"
      },
      {
        icon: "consult",
        title: "Technical consultancy",
        desc: "Architecture review, discovery and delivery planning for teams who need a second opinion before committing budget.",
        meta: "Architecture · Discovery · Audit"
      }
    ],

    // 🔴 PLACEHOLDER — grouped tech stack
    techStack: [
      { label: "Frontend",   items: ["TypeScript", "React", "Next.js", "Vue", "Tailwind CSS", "React Native"] },
      { label: "Backend",    items: ["Node.js", "Python", "Go", "FastAPI", "NestJS", "PostgreSQL", "Redis"] },
      { label: "AI / ML",    items: ["PyTorch", "Hugging Face", "LangChain", "pgvector", "OpenAI & Anthropic APIs", "ONNX"] },
      { label: "Platform",   items: ["AWS", "Google Cloud", "Docker", "Kubernetes", "Terraform", "GitHub Actions"] }
    ],

    // 🔴 PLACEHOLDER — same card component, named + anonymised mix
    featuredWork: [
      {
        client: { name: "Meridian Logistics", sector: "Supply chain" },
        title: "Freight visibility platform",
        summary: "A ground-up replacement for a spreadsheet-driven operation: live shipment tracking, exception alerting and a carrier portal, rolled out across three regions without downtime.",
        tags: ["React", "Node.js", "PostgreSQL", "AWS"],
        metrics: [
          { value: "8 mo",  label: "Discovery to launch" },
          { value: "3",     label: "Regions live" },
          { value: "-62%",  label: "Manual coordination" }
        ]
      },
      {
        client: { descriptor: "Series B healthtech company", sector: "Healthcare" },
        title: "Clinical document intelligence",
        summary: "A retrieval and summarisation layer over a decade of clinical documentation, with a human-in-the-loop review queue and full audit trail for regulatory sign-off.",
        tags: ["Python", "RAG", "pgvector", "HIPAA-aligned"],
        metrics: [
          { value: "1.4M", label: "Documents indexed" },
          { value: "< 2s", label: "Median query time" },
          { value: "94%",  label: "Reviewer agreement" }
        ]
      },
      {
        client: { name: "Kestrel Field Services", sector: "Field operations" },
        title: "Offline-first mobile workforce app",
        summary: "A field inspection app for technicians working without reliable connectivity — local-first data, conflict-safe sync and photo evidence capture with automatic upload on reconnect.",
        tags: ["React Native", "Offline-first", "Sync engine"],
        metrics: [
          { value: "2,100+", label: "Daily active users" },
          { value: "4.7★",   label: "Store rating" },
          { value: "99.95%", label: "Sync success" }
        ]
      },
      {
        client: { descriptor: "Internal — Orbitech", sector: "Own platform" },
        title: "Workforce operations platform",
        summary: "The system that runs our own delivery: skill-matched job routing, submission-level acceptance tracking and at-risk flagging across a thousand-person contributor network.",
        tags: ["Internal tooling", "Automation", "Dogfooded"],
        metrics: [
          { value: "1,000+", label: "Contributors managed" },
          { value: "0",      label: "Missed client deadlines" },
          { value: "Daily",  label: "In production use" }
        ]
      }
    ]
  },


  /* ======================================================================
     🔴 6. WHY ORBITECH — the combined-capability differentiator
     ====================================================================== */
  why: {
    compare: {
      them: {
        label: "The usual arrangement",
        items: [                                            // 🔴 PLACEHOLDER
          "A data vendor labels your training set to a spec they didn't help write.",
          "A separate dev shop builds the product, with no visibility into how the data was produced.",
          "You become the integration layer — translating between two suppliers who never speak.",
          "When quality dips, each side points at the other and nobody owns the fix."
        ]
      },
      us: {
        label: "With Orbitech",
        items: [                                            // 🔴 PLACEHOLDER
          "One team scopes the annotation schema and the system that will consume it, together.",
          "Pipeline, labelling guidelines and model evaluation are designed against each other from day one.",
          "A single point of accountability for both the data and the product built on it.",
          "Feedback from production flows straight back into the labelling spec — no vendor round-trip."
        ]
      }
    },

    // 🔴 PLACEHOLDER
    points: [
      {
        title: "Built for AI/ML teams specifically",
        desc: "The gap between a labelled dataset and a working product is where most AI projects stall. We work on both sides of it, so nothing is thrown over a wall."
      },
      {
        title: "Network scale with in-house control",
        desc: "A 500-strong specialist network gives us reach into languages most agencies can't staff. A salaried engineering team gives us the consistency a network alone can't."
      },
      {
        title: "Quality measured, not asserted",
        desc: "Acceptance rate, inter-annotator agreement and reviewer throughput are tracked per contributor and reported to you — the same numbers we run the business on."
      },
      {
        title: "We use what we build",
        desc: "Our own delivery runs on software our engineers wrote. When we recommend a tooling approach, it's because we operate it daily, not because it demos well."
      }
    ]
  },


  /* ======================================================================
     🔴 7. TEAM
     --------------------------------------------------------------------
     `photo` — path to a real image, e.g. "assets/img/team/asha.jpg".
                Leave as null to render the generated initials placeholder.
     ====================================================================== */
  team: [
    {
      name: "A. Rahman",                                   // 🔴 PLACEHOLDER
      role: "Founder & Managing Director",
      bio: "Fifteen years in multilingual data operations. Leads client strategy and keeps delivery honest across both service lines.",
      photo: null
    },
    {
      name: "M. Chowdhury",                                // 🔴 PLACEHOLDER
      role: "Head of Data Solutions",
      bio: "Runs the annotation and linguistics network. Built the vetting process that keeps first-pass acceptance above 98%.",
      photo: null
    },
    {
      name: "S. Ahmed",                                    // 🔴 PLACEHOLDER
      role: "Head of Engineering",
      bio: "Full-stack and platform background. Owns architecture and delivery standards for every client engagement.",
      photo: null
    },
    {
      name: "N. Islam",                                    // 🔴 PLACEHOLDER
      role: "Operations Lead",
      bio: "Keeps four to six concurrent projects on schedule. Designed the at-risk flagging that replaced manual check-ins.",
      photo: null
    },
    {
      name: "T. Hasan",                                    // 🔴 PLACEHOLDER
      role: "Lead AI Engineer",
      bio: "Works across model integration, evaluation harnesses and the retrieval systems behind our clients' AI products.",
      photo: null
    },
    {
      name: "R. Karim",                                    // 🔴 PLACEHOLDER
      role: "Quality & Linguistics Manager",
      bio: "Sets quality bars per project and manages the reviewer layer. Specialist in low-resource language sourcing.",
      photo: null
    }
  ],


  /* ======================================================================
     🔴 8. JOIN OUR TEAM
     ====================================================================== */
  join: {

    // 🔴 PLACEHOLDER — why join
    pitch: [
      {
        icon: "globe",
        title: "Work from anywhere",
        desc: "Our network spans 20+ time zones. Everything is remote and asynchronous by default — no relocation, no fixed hours."
      },
      {
        icon: "clock",
        title: "Choose your load",
        desc: "Take the projects that fit your week. Contributors range from a few hours to full-time equivalent, and you set which."
      },
      {
        icon: "layers",
        title: "Genuinely varied work",
        desc: "Annotation one month, transcription or post-editing the next, across industries from healthcare to frontier AI research."
      },
      {
        icon: "trend",
        title: "Track record that travels",
        desc: "Your acceptance rate and project history build a visible record with us — and it's what gets you first call on the next brief."
      },
      {
        icon: "pay",
        title: "Clear, on-time payment",
        desc: "Rates agreed before you start, tied to accepted work, paid on a fixed schedule. No opaque deductions."
      },
      {
        icon: "support",
        title: "Real support, not a ticket queue",
        desc: "A named operations contact per project, written guidelines up front, and answers in hours rather than days."
      }
    ],

    /* 🔴 PLACEHOLDER — refresh this regularly, it's the most time-sensitive
       content on the page. Keep it honest: listing roles you aren't hiring
       for is the fastest way to burn talent-network goodwill. */
    inDemand: {
      lastUpdated: "August 2026",                          // 🔴 PLACEHOLDER
      groups: [
        {
          label: "Languages",
          items: ["Czech", "Portuguese (EU)", "Norwegian", "Finnish", "Vietnamese",
                  "Hebrew", "Swahili", "Nepali", "Slovak", "Danish"]
        },
        {
          label: "Skills",
          items: ["Medical transcription", "Legal MTPE", "Audio diarisation",
                  "LiDAR / 3D annotation", "RLHF preference ranking",
                  "Native-speaker QA review"]
        }
      ]
    },

    // Options for the "How did you hear about us?" field
    referralSources: [
      "LinkedIn",
      "A friend or colleague",
      "Search engine",
      "A freelancing platform",
      "Facebook or a community group",
      "Worked with Orbitech before",
      "Other"
    ]
  },


  /* ======================================================================
     🔴 9. TRUST & CONFIDENTIALITY
     --------------------------------------------------------------------
     ⚠️  IMPORTANT: this copy is written to be truthful WITHOUT claiming any
     certification. Do not add "ISO 27001 certified", "SOC 2 compliant" or
     similar until you actually hold the certification — describing your
     practices is fine, claiming an audit you haven't passed is not.
     ====================================================================== */
  trust: {
    items: [                                                // 🔴 PLACEHOLDER
      {
        icon: "nda",
        title: "NDAs as standard",
        desc: "Every contributor signs a confidentiality agreement before receiving access to any client material. Project-specific NDAs are supported where you require your own."
      },
      {
        icon: "access",
        title: "Need-to-know access",
        desc: "Contributors see only the data required for their assigned task, for as long as the task is open. Access is revoked automatically on completion."
      },
      {
        icon: "shield",
        title: "Controlled environments",
        desc: "Sensitive projects can be run inside your own systems or a restricted environment we provision, with no local download and no residual copies."
      },
      {
        icon: "trace",
        title: "Traceable handling",
        desc: "Every unit is attributable to the contributor who worked on it and the reviewer who checked it, so any concern can be traced to a specific point in the chain."
      },
      {
        icon: "delete",
        title: "Defined retention",
        desc: "Retention and deletion windows are agreed in the contract, and we confirm deletion in writing at project close."
      },
      {
        icon: "region",
        title: "Data residency options",
        desc: "Where a project requires data to stay within a jurisdiction, we can restrict both storage location and contributor location accordingly."
      }
    ],

    // 🔴 PLACEHOLDER — the honest caveat. Keep something like it.
    note: "Orbitech is building towards formal information-security certification. We are not yet certified, and we won't claim otherwise — what we can do today is meet your security requirements contractually, work inside your environment and controls, and complete your vendor security assessment in full. Ask us for our current data-handling policy and we'll send it before you share anything."
  },


  /* ======================================================================
     10. CONTACT FORM
     ====================================================================== */
  contact: {
    inquiryTypes: [
      {
        value: "quote",
        title: "Get a project quote",
        desc: "You have a brief, a rough scope or a deadline. We'll come back with an approach and a number."
      },
      {
        value: "general",
        title: "General enquiry",
        desc: "Questions, partnerships, or you're just working out whether we're a fit. No commitment."
      }
    ],
    // Which service lines a client can flag interest in
    interests: [
      "Data annotation", "Transcription", "Translation & localisation", "MTPE",
      "Data collection", "Custom software", "AI/ML engineering", "Not sure yet"
    ]
  },


  /* ======================================================================
     11. FOOTER
     ====================================================================== */
  footer: {
    columns: [
      {
        title: "Solutions",
        links: [
          { label: "Data Solutions",       href: "#solutions" },
          { label: "Software Development", href: "#software" },
          { label: "Featured work",        href: "#work" },
          { label: "Why Orbitech",         href: "#why" }
        ]
      },
      {
        title: "Company",
        links: [
          { label: "Meet the team",        href: "#team" },
          { label: "Trust & security",     href: "#trust" },
          { label: "Contact",              href: "#contact" }
        ]
      },
      {
        title: "For talent",
        links: [
          { label: "Join our team", href: "#join", highlight: true },
          { label: "Roles in demand", href: "#join" },
          { label: "How we work",     href: "#join" }
        ]
      }
    ],
    // 🔴 PLACEHOLDER — point these at real pages when they exist
    legal: [
      { label: "Privacy policy",    href: "#" },
      { label: "Terms of service",  href: "#" },
      { label: "Data handling",     href: "#" }
    ]
  }
};

/* Expose for app.js. Kept as a plain global so the site works when opened
   directly from the filesystem (file://), where ES modules are blocked. */
window.ORBITECH = ORBITECH;
