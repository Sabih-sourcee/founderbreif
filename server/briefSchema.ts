import { Type } from "@google/genai";

export type DocumentOutputType =
  | "PRD"
  | "Business Plan"
  | "Resume"
  | "Pitch Deck Outline"
  | "Generic Brief";

export const BRIEF_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  required: [
    "title",
    "tldr",
    "description",
    "complexity",
    "estimatedBudget",
    "businessGoals",
    "userGoals",
    "nonGoals",
    "userStories",
    "functionalRequirements",
    "userExperience",
    "narrative",
    "successMetrics",
    "technicalConsiderations",
    "milestones",
    "documentMarkdown",
  ],
  properties: {
    title: { type: Type.STRING, description: "Professional document title." },
    tldr: { type: Type.STRING, description: "2-3 sentence executive summary." },
    description: { type: Type.STRING, description: "One-sentence summary." },
    complexity: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
    estimatedBudget: { type: Type.STRING, description: "USD range or target scope e.g. $12,000 - $18,000" },
    businessGoals: { type: Type.ARRAY, items: { type: Type.STRING } },
    userGoals: { type: Type.ARRAY, items: { type: Type.STRING } },
    nonGoals: { type: Type.ARRAY, items: { type: Type.STRING } },
    userStories: { type: Type.ARRAY, items: { type: Type.STRING } },
    functionalRequirements: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          priority: { type: Type.STRING, enum: ["Highest", "High", "Medium"] },
          details: { type: Type.STRING },
        },
      },
    },
    userExperience: {
      type: Type.OBJECT,
      properties: {
        entryPoint: { type: Type.STRING },
        coreSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
        advancedFeatures: { type: Type.ARRAY, items: { type: Type.STRING } },
        uiHighlights: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
    },
    narrative: { type: Type.STRING, description: "A short narrative paragraph tailored to the document type." },
    successMetrics: {
      type: Type.OBJECT,
      properties: {
        userCentric: { type: Type.ARRAY, items: { type: Type.STRING } },
        business: { type: Type.ARRAY, items: { type: Type.STRING } },
        technical: { type: Type.ARRAY, items: { type: Type.STRING } },
        trackingPlan: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
    },
    technicalConsiderations: {
      type: Type.OBJECT,
      properties: {
        needs: { type: Type.ARRAY, items: { type: Type.STRING } },
        integrations: { type: Type.ARRAY, items: { type: Type.STRING } },
        privacy: { type: Type.ARRAY, items: { type: Type.STRING } },
        scalability: { type: Type.ARRAY, items: { type: Type.STRING } },
        challenges: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
    },
    milestones: {
      type: Type.OBJECT,
      properties: {
        estimate: { type: Type.STRING },
        teamSize: { type: Type.STRING },
        phases: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              duration: { type: Type.STRING },
              deliverables: { type: Type.STRING },
            },
          },
        },
      },
    },
    documentMarkdown: {
      type: Type.STRING,
      description:
        "Complete, export-ready document in Markdown (with ## section headers and bullet lists) tailored to the selected documentType (PRD, Business Plan, Resume, Pitch Deck Outline, or Generic Brief). Ready for Word, PDF, and TXT export.",
    },
  },
};

const DOC_TYPE_INSTRUCTIONS: Record<DocumentOutputType, string> = {
  PRD: `Format as a complete Product Requirements Document (PRD) for non-technical South Asian & global founders:
- Sections in documentMarkdown: ## Executive Summary, ## Problem & Market Wedge, ## User Stories, ## Functional Scope (MVP vs v2), ## UX & Regional Localization (Urdu/Hindi/Arabic/English), ## Technical Stack & Integrations, ## Phased Delivery Milestones.`,
  "Business Plan": `Format as an investor-ready Business Plan:
- Sections in documentMarkdown: ## Executive Summary, ## Market Opportunity & Target Customer, ## Value Proposition & Product Offering, ## Revenue Model & Unit Economics, ## Go-To-Market & Regional Distribution, ## Operations & Team Plan, ## 12-Month Financial & Milestone Roadmap.`,
  Resume: `Format as a high-impact Executive / Founder / Product Resume & Bio Dossier:
- Sections in documentMarkdown: ## Professional Summary, ## Core Competencies & Domain Expertise, ## Featured Ventures & Experience Highlights, ## Key Achievements & Quantified Impact, ## Technical & Language Fluency (Urdu/Hindi/Arabic/English), ## Education & Credentials.`,
  "Pitch Deck Outline": `Format as a 10-Slide Y Combinator / Seed Investor Pitch Deck Outline:
- Sections in documentMarkdown: ## Slide 1: Title & One-Line Wedge, ## Slide 2: The Pain Point, ## Slide 3: The Solution & Product Demo Flow, ## Slide 4: Why Now & Regional Market Size (TAM/SAM/SOM), ## Slide 5: Business Model & Pricing, ## Slide 6: Traction & Validation, ## Slide 7: Competition & Moat, ## Slide 8: Go-To-Market Roadmap, ## Slide 9: Founder DNA & Team, ## Slide 10: The Ask & Use of Funds.`,
  "Generic Brief": `Format as a structured Executive & Action Brief:
- Sections in documentMarkdown: ## Overview & Objective, ## Key Takeaways, ## Core Action Items & Owners, ## Strategic Decisions & Constraints, ## Next Steps & Timeline.`,
};

export function getBriefSystemInstruction(documentType: DocumentOutputType = "PRD"): string {
  return `You are an elite startup advisor and document architect for non-technical South Asian and global founders. Handle Urdu, Hindi, Arabic, and English inputs effortlessly. Output valid JSON matching the schema for a ${documentType}. The documentMarkdown must be a complete, export-ready document in Markdown with ## section headers.`;
}

function formatCalibration(answers: Record<string, unknown> | undefined): string {
  const raw = (answers as { calibration?: unknown } | undefined)?.calibration;
  if (!Array.isArray(raw)) return "";
  const lines = raw
    .map((item) => {
      const q = typeof (item as { question?: unknown })?.question === "string" ? (item as { question: string }).question.trim() : "";
      const a = typeof (item as { answer?: unknown })?.answer === "string" ? (item as { answer: string }).answer.trim() : "";
      return q && a ? `- Q: ${q.slice(0, 300)}\n  A: ${a.slice(0, 1200)}` : "";
    })
    .filter(Boolean);
  return lines.length ? lines.join("\n") : "";
}
export function buildBriefPrompt(
  idea: string,
  answers: Record<string, string | undefined>,
  documentType: DocumentOutputType = "PRD",
  spokenLanguage: string = "Auto (Urdu / Hindi / Arabic / English)"
) {
  const typeInstruction = DOC_TYPE_INSTRUCTIONS[documentType] || DOC_TYPE_INSTRUCTIONS.PRD;

  return `
You are an elite startup advisor, product architect, and executive writer for FounderBrief — built for non-technical South Asian and global founders who speak in English, Urdu, Hindi, Arabic, or mixed code-switching (Roman Urdu / Hinglish).

Selected Output Document Type: "${documentType}"
Spoken / Input Language Context: "${spokenLanguage}"

Founder's spoken or written voice input:
"${idea}"

Context & Calibration Parameters:
- Platform / Channel: ${answers?.platform || "Both"} (${answers?.platformDetails || "standard"})
- Access / Auth Model: ${answers?.auth || "Email & Phone OTP"} (${answers?.authDetails || "standard"})
- Core Integrations / Tools: ${answers?.integrations || "Payments & Messaging"} (${answers?.integrationsDetails || "standard"})
- Target Timeline: ${answers?.timeline || "3-6 months"} (${answers?.timelineDetails || "standard"})

${formatCalibration(answers) ? `Founder's answers to calibration questions (treat these as ground truth and use them throughout the document):\n${formatCalibration(answers)}\n\n` : ""}Instructions:
1. If the founder's input contains Urdu, Hindi, Arabic, or Roman Urdu/Hinglish phrases, preserve their intent accurately and translate/synthesize into clear, professional English while noting regional nuances where helpful.
2. ${typeInstruction}
3. Populate all JSON schema fields thoughtfully so the structured UI cards AND the full documentMarkdown are rich, concrete, and immediately ready for Word (.doc), PDF (.pdf), and TXT (.txt) export.
`.trim();
}
