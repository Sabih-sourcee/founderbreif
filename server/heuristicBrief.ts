import { DocumentOutputType } from "./briefSchema";

export function cleanAndExtractTitle(idea: string, documentType: DocumentOutputType = "PRD"): string {
  const words = idea.trim().split(/\s+/).filter((w) => w.length > 2);
  const suffixMap: Record<DocumentOutputType, string> = {
    PRD: "Product Spec",
    "Business Plan": "Business Plan",
    Resume: "Founder Resume",
    "Pitch Deck Outline": "Pitch Deck",
    "Generic Brief": "Executive Brief",
  };
  const suffix = suffixMap[documentType] || "Document";

  if (words.length >= 2) {
    const cleanWords = words
      .slice(0, 3)
      .map((w) => w.replace(/[^a-zA-Z0-9]/g, ""))
      .filter((w) => w.length > 0);
    if (cleanWords.length >= 2) {
      return (
        cleanWords.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ") +
        ` — ${suffix}`
      );
    }
  }
  return `FounderBrief ${suffix}`;
}

export function buildHeuristicBrief(
  idea: string,
  answers: Record<string, string | undefined>,
  documentType: DocumentOutputType = "PRD",
  spokenLanguage: string = "Urdu / Hindi / Arabic / English"
) {
  const title = cleanAndExtractTitle(idea, documentType);
  const platform = answers?.platform || "Both";
  const auth = answers?.auth || "Phone OTP & Email";
  const integrations = answers?.integrations || "Payments & WhatsApp";
  const timeline = answers?.timeline || "3-6 months";

  let complexity: "Low" | "Medium" | "High" = "Medium";
  let estimatedBudget = "$10,000 - $16,000";
  if (platform === "Both") {
    complexity = "High";
    estimatedBudget = "$18,000 - $28,000";
  } else if (platform === "Android" || platform === "iPhone") {
    complexity = "Low";
    estimatedBudget = "$7,500 - $12,000";
  }

  const tldr = `[${documentType}] Synthesized from multilingual voice input (${spokenLanguage}): ${idea.slice(0, 140)}${idea.length > 140 ? "…" : ""}. Structured for immediate Word, PDF, and TXT export or Read Aloud audio playback.`;
  const description = tldr.split(".")[0] + ".";

  const businessGoals = [
    `Deliver a crystal-clear ${documentType} from raw spoken founder notes without technical jargon.`,
    "Support seamless Urdu, Hindi, Arabic, and English founder workflows.",
    `Execute the core roadmap within ${timeline} with predictable milestones.`,
  ];

  const userGoals = [
    "Turn voice thoughts into structured documents in under 60 seconds.",
    "Export directly to Word (.doc), PDF, or TXT for investors, hiring, or dev agencies.",
    "Listen back on the go using Read Aloud neural voices at 0.5x–1.5x speed.",
  ];

  const nonGoals = [
    "Avoid bloated enterprise overhead in Phase 1 — stay laser-focused on core validation.",
    "No unverified third-party dependencies outside the core workflow.",
  ];

  const userStories = [
    `As a founder speaking in ${spokenLanguage}, I want my voice note converted into a ${documentType} so I can align stakeholders immediately.`,
    `As a user, I want ${auth} access and ${integrations} support so onboarding is frictionless.`,
    `As an executive on the move, I want to switch this ${documentType} into Read Aloud audio mode to review it hands-free.`,
  ];

  const functionalRequirements = [
    {
      name: `${documentType} Core Structure`,
      priority: "Highest" as const,
      details: `Complete section breakdown tailored to: ${idea.slice(0, 90)}`,
    },
    {
      name: "Multilingual Voice Context",
      priority: "High" as const,
      details: `Preserves terminology across ${spokenLanguage} and formats into clean executive prose.`,
    },
    {
      name: `${auth} & ${integrations}`,
      priority: "High" as const,
      details: "Fast verification and regional payment/messaging hooks.",
    },
    {
      name: "Multi-Format Export & Read Aloud",
      priority: "Medium" as const,
      details: "One-click export to Word, PDF, TXT plus neural TTS audio synthesis.",
    },
  ];

  const userExperience = {
    entryPoint: "Record voice bubble → Select document type → Review & Export or Read Aloud.",
    coreSteps: [
      "Record voice note in Urdu, Hindi, Arabic, or English inside the bubble chat thread.",
      `Select "${documentType}" from the post-recording selector pill.`,
      "Review structured sections and export to Word, PDF, or TXT.",
      "Tap Read Aloud to listen with natural voices at 0.5x–1.5x speed.",
    ],
    advancedFeatures: [
      "Unified Library storing both Voice → Doc and Doc → Voice items.",
      "Offline-resilient draft and audio playback controls.",
    ],
    uiHighlights: [
      "Dynamic Bubble UI (#DAF7F3 soft teal, #FBFF28 electric yellow, #1C2120 dark bubbles)",
      "One-click Word / PDF / TXT export strip",
    ],
  };

  const narrative = `A founder records a quick voice note explaining "${idea.slice(0, 75)}". Seconds later, FounderBrief transforms the spoken thread into a polished ${documentType} ready to share as a Word doc or PDF — or play back aloud while commuting.`;

  const successMetrics = {
    userCentric: [
      "Voice-to-document completion under 45 seconds.",
      "High clarity score from dev shops, co-founders, and investors.",
    ],
    business: [
      `Launch target achieved within ${timeline}.`,
      "Clear scope alignment reducing agency quote variance by 40%.",
    ],
    technical: [
      "99.5% transcription and synthesis reliability across Urdu, Hindi, Arabic, and English.",
      "Instant export generation for Word, PDF, and TXT.",
    ],
    trackingPlan: [
      "Document type selection distribution.",
      "Export format usage (Word vs PDF vs TXT) and Read Aloud playback minutes.",
    ],
  };

  const technicalConsiderations = {
    needs: [`${platform} client experience`, "Multilingual ASR & LLM formatting", "Neural TTS audio pipeline"],
    integrations: [integrations, "WhatsApp / Email document sharing", "Cloud Library sync"],
    privacy: ["Encrypted voice note transport", "Private founder library storage"],
    scalability: ["Streaming audio synthesis", "Modular document templates"],
    challenges: ["Handling mixed code-switched speech (Roman Urdu / Hinglish / Arabic)", "Maintaining clean formatting across Word and PDF exports"],
  };

  const milestones = {
    estimate: timeline,
    teamSize: "Lean Founder + 1-2 Specialists",
    phases: [
      {
        name: "Phase 1 — Core Foundation & Validation",
        duration: "Week 1–2",
        deliverables: `Finalize ${documentType} scope, validate with first 10 target users.`,
      },
      {
        name: "Phase 2 — Build & Workflow Integration",
        duration: "Week 3–6",
        deliverables: `Implement ${platform} workflows, ${auth}, and ${integrations}.`,
      },
      {
        name: "Phase 3 — Launch & Scale",
        duration: "Week 7–8",
        deliverables: "Go-live, telemetry review, and iterative expansion.",
      },
    ],
  };

  let documentMarkdown = "";

  if (documentType === "Business Plan") {
    documentMarkdown = `# ${title}

### Executive Summary

${tldr}

---

## 1. Market Opportunity & Problem Statement

* **Core Problem:** ${idea}
* **Target Wedge:** Non-technical founders and operators across South Asia, MENA, and global diaspora markets.
* **Why Now:** Voice-first workflows in Urdu, Hindi, Arabic, and English unlock 10x faster execution.

---

## 2. Value Proposition & Solution

${businessGoals.map((g) => `* ${g}`).join("\n")}

---

## 3. Revenue Model & Pricing Strategy

* **Free Tier:** 3 generations or audio reads per month, standard voices, core exports.
* **Pro Tier ($18/mo or $139/yr):** Unlimited voice-to-doc generations, unlimited Read Aloud TTS synthesis, premium neural voices, and full Word/PDF/TXT + MP3/AAC/WAV exports.

---

## 4. Operations & Technical Rollout

* **Platform Scope:** ${platform}
* **Access & Verification:** ${auth}
* **Key Integrations:** ${integrations}

---

## 5. 12-Month Milestones (${milestones.estimate})

${milestones.phases.map((p) => `* **${p.name}** (${p.duration}): ${p.deliverables}`).join("\n")}
`;
  } else if (documentType === "Resume") {
    documentMarkdown = `# ${title}

### Executive Bio & Summary

${idea}

---

## Core Competencies

* **Product & Venture Strategy:** Zero-to-one concept validation, MVP scoping, and stakeholder alignment.
* **Cross-Functional Leadership:** Directing engineering, design, and regional GTM teams (${milestones.teamSize}).
* **Multilingual Communication:** Fluent workflow execution across ${spokenLanguage}.

---

## Key Venture & Project Highlights

* **Primary Initiative:** ${idea.slice(0, 140)}
* **Architecture & Delivery:** Spearheaded ${platform} rollout integrating ${auth} and ${integrations}.
* **Measurable Impact:** ${successMetrics.business.join(" ")}

---

## Execution Roadmap & Deliverables

${milestones.phases.map((p) => `* **${p.name}** (${p.duration}) — ${p.deliverables}`).join("\n")}
`;
  } else if (documentType === "Pitch Deck Outline") {
    documentMarkdown = `# ${title}

### Slide 1 — Vision & One-Line Wedge

* **Title:** ${title}
* **The Hook:** ${idea.slice(0, 140)}

---

## Slide 2 — The Problem

* Founders and operators lose critical momentum translating spoken ideas into investor- and developer-ready documents.
* Existing tools ignore Urdu, Hindi, Arabic, and mixed-language voice workflows.

---

## Slide 3 — The Solution

* **Voice → Document:** Speak naturally and generate a ${documentType}, PRD, Business Plan, or Resume in seconds.
* **Document → Voice (Read Aloud):** Listen to any imported or generated document with natural voices at 0.5x–1.5x speed.

---

## Slide 4 — Product & Technical Architecture

* **Platforms:** ${platform}
* **Onboarding:** ${auth}
* **Ecosystem Hooks:** ${integrations}

---

## Slide 5 — Business Model & Unit Economics

* **Free Plan:** 3 generations/reads per month with standard voices.
* **Pro Plan ($18/mo or $139/yr):** Unlimited generations + neural TTS reads, justifying audio pipeline compute with high founder retention.

---

## Slide 6 — Go-To-Market & Milestones (${milestones.estimate})

${milestones.phases.map((p) => `* **${p.name}** (${p.duration}): ${p.deliverables}`).join("\n")}

---

## Slide 7 — The Ask & Use of Funds

* **Target Budget / Seed Scope:** ${estimatedBudget} (${complexity} Complexity)
* **Team Allocation:** ${milestones.teamSize}
`;
  } else if (documentType === "Generic Brief") {
    documentMarkdown = `# ${title}

### Executive Overview

${tldr}

---

## Key Objectives

${businessGoals.map((g) => `* ${g}`).join("\n")}

---

## Action Items & Requirements

${functionalRequirements.map((r) => `* **[${r.priority}] ${r.name}:** ${r.details}`).join("\n")}

---

## Operational Decisions

* **Target Platform:** ${platform}
* **Authentication / Access:** ${auth}
* **Integrations:** ${integrations}
* **Timeline:** ${timeline}

---

## Next Steps

${milestones.phases.map((p) => `* **${p.name}** (${p.duration}): ${p.deliverables}`).join("\n")}
`;
  } else {
    documentMarkdown = `# ${title}

### TL;DR

${tldr}

---

## Goals

### Business Goals

${businessGoals.map((g) => `* ${g}`).join("\n")}

### User Goals

${userGoals.map((g) => `* ${g}`).join("\n")}

### Non-Goals

${nonGoals.map((g) => `* ${g}`).join("\n")}

---

## User Stories

${userStories.map((s) => `* ${s}`).join("\n")}

---

## Functional Requirements

${functionalRequirements.map((r) => `* **${r.name} (${r.priority})** — ${r.details}`).join("\n")}

---

## User Experience

**Entry Point:** ${userExperience.entryPoint}

**Core Experience**

${userExperience.coreSteps.map((s, i) => `${i + 1}. ${s}`).join("\n")}

**UI Highlights:** ${userExperience.uiHighlights.join("; ")}

---

## Narrative

${narrative}

---

## Success Metrics

**User-centric:** ${successMetrics.userCentric.join("; ")}

**Business:** ${successMetrics.business.join("; ")}

**Technical:** ${successMetrics.technical.join("; ")}

---

## Technical Considerations

* **Stack needs:** ${technicalConsiderations.needs.join(", ")}
* **Integrations:** ${technicalConsiderations.integrations.join(", ")}
* **Privacy:** ${technicalConsiderations.privacy.join("; ")}

---

## Milestones

**Estimate:** ${milestones.estimate} | **Team:** ${milestones.teamSize}

${milestones.phases.map((p) => `* **${p.name}** (${p.duration}): ${p.deliverables}`).join("\n")}

---

**Complexity:** ${complexity} | **Budget:** ${estimatedBudget}
`;
  }

  return {
    title,
    tldr,
    description,
    complexity,
    estimatedBudget,
    businessGoals,
    userGoals,
    nonGoals,
    userStories,
    functionalRequirements,
    userExperience,
    narrative,
    successMetrics,
    technicalConsiderations,
    milestones,
    documentMarkdown,
    documentType,
    spokenLanguage,
  };
}
