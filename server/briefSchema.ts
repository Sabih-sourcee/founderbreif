import { Type } from "@google/genai";

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
    title: { type: Type.STRING, description: "Professional project title." },
    tldr: { type: Type.STRING, description: "2-3 sentence TL;DR summary." },
    description: { type: Type.STRING, description: "One-sentence product summary." },
    complexity: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
    estimatedBudget: { type: Type.STRING, description: "USD range e.g. $12,000 - $18,000" },
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
    narrative: { type: Type.STRING, description: "A short story-style paragraph about a user benefiting from the product." },
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
        "Full product brief as clean Markdown matching professional PRD format: TL;DR, Goals, User Stories, Functional Requirements, UX, Narrative, Success Metrics, Technical Considerations, Milestones. Use ## headers and bullet lists.",
    },
  },
};

export function buildBriefPrompt(idea: string, answers: Record<string, string | undefined>) {
  return `
You are an elite product architect and CTO. Write a comprehensive, readable product brief document for a non-technical founder.

Founder's product vision:
"${idea}"

Questionnaire:
- Platform: ${answers?.platform || "Both"} (${answers?.platformDetails || "none"})
- Authentication: ${answers?.auth || "Email & Password"} (${answers?.authDetails || "none"})
- Integrations: ${answers?.integrations || "Standard"} (${answers?.integrationsDetails || "none"})
- Grid system: ${answers?.gridSystem || "3×3"}
- Font style: ${answers?.fontStyle || "Modern Sans"}
- Color theme: ${answers?.colorTheme || "Warm Minimal"}
- Timeline: ${answers?.timeline || "3-6 months"} (${answers?.timelineDetails || "none"})

Write in plain, accessible language — founders and investors must understand every section without a CS degree.
Include realistic budget and complexity. Tie design choices (grid, fonts, colors) into UX and technical sections.
The documentMarkdown field must be the complete brief as polished Markdown (with ## sections) ready to export as PDF.
`.trim();
}
