import {
  BriefAnswers,
  BriefApiResponse,
  CalibrationAnswer,
  DEFAULT_ANSWERS,
  DocumentOutputType,
  SpokenLanguage,
} from "../types";
import { SECTION_TITLES } from "../constants/questions";

/**
 * Maps real calibration Q&A onto the legacy answer keys the generation API
 * understands, and attaches the full Q&A list for the document prompt.
 */
export function buildApiAnswers(
  docType: DocumentOutputType,
  calibration: CalibrationAnswer[]
): BriefAnswers {
  const answers: BriefAnswers = { ...DEFAULT_ANSWERS, calibration };
  if (docType === "PRD" && calibration.length >= 7) {
    const text = (calibration[1]?.answer ?? "").toLowerCase();
    if (/android/.test(text) && !/(iphone|ios)/.test(text)) answers.platform = "Android";
    else if (/(iphone|ios)/.test(text) && !/android/.test(text)) answers.platform = "iPhone";
    answers.platformDetails = calibration[1]?.answer ?? "";
    answers.authDetails = calibration[4]?.answer ?? "";
    answers.integrationsDetails = calibration[5]?.answer ?? "";
    answers.timeline = calibration[6]?.answer || answers.timeline;
  }
  return answers;
}

/** Offline document used only when the generation API is unreachable. */
export function buildLocalFallbackBrief(
  idea: string,
  answers: BriefAnswers,
  documentType: DocumentOutputType,
  spokenLanguage: SpokenLanguage
): BriefApiResponse {
  const words = idea.trim().split(/\s+/).slice(0, 5).join(" ") || "Your Venture";
  const cleanTitle = `${words.replace(/[^\p{L}\p{N}\s]/gu, "").trim() || "FounderBrief"} — ${documentType}`;
  const summary = `${idea.slice(0, 220)}${idea.length > 220 ? "…" : ""}`;
  const calibration = answers.calibration ?? [];
  const sectionTitles = SECTION_TITLES[documentType] ?? [];

  const sections: string[] = [];
  sections.push(`## 1. Executive Summary\n\n${summary}`);
  let n = 2;
  calibration.forEach((qa, i) => {
    if (!qa.answer.trim()) return;
    const title = sectionTitles[i] ?? `Details ${i + 1}`;
    sections.push(`## ${n}. ${title}\n\n**${qa.question}**\n\n${qa.answer.trim()}`);
    n += 1;
  });
  if (calibration.length === 0) {
    sections.push(`## 2. Your Idea\n\n${idea.trim()}`);
    sections.push(
      `## 3. Suggested Next Steps\n\n- Answer the calibration questions to add detail.\n- Re-generate this ${documentType} once the backend is reachable.`
    );
  }

  const documentMarkdown = `# ${cleanTitle}\n\n${sections.join("\n\n")}\n\n---\n\n> Generated offline from your ${spokenLanguage} voice input. Reconnect to enrich this ${documentType} with AI.`;

  const empty: string[] = [];
  return {
    title: cleanTitle,
    tldr: summary,
    description: summary,
    complexity: "Medium",
    estimatedBudget: "To be estimated",
    businessGoals: empty,
    userGoals: empty,
    nonGoals: empty,
    userStories: empty,
    functionalRequirements: [],
    userExperience: { entryPoint: "", coreSteps: empty, advancedFeatures: empty, uiHighlights: empty },
    narrative: summary,
    successMetrics: { userCentric: empty, business: empty, technical: empty, trackingPlan: empty },
    technicalConsiderations: { needs: empty, integrations: empty, privacy: empty, scalability: empty, challenges: empty },
    milestones: { estimate: "", teamSize: "", phases: [] },
    documentMarkdown,
    documentType,
    spokenLanguage,
  };
}
