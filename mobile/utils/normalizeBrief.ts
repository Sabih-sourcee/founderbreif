import { DEFAULT_ANSWERS, ProjectBrief } from "../types";

export function normalizeBrief(raw: Partial<ProjectBrief> & { coreFeatures?: string[]; devQuestions?: string[] }): ProjectBrief {
  const answers = { ...DEFAULT_ANSWERS, ...(raw.answers ?? {}) };
  const legacyFeatures = raw.coreFeatures ?? [];
  const legacyQuestions = raw.devQuestions ?? [];

  return {
    id: raw.id ?? `spec-${Date.now()}`,
    title: raw.title ?? "Project Brief",
    tldr: raw.tldr ?? raw.description ?? "",
    description: raw.description ?? "",
    complexity: raw.complexity ?? "Medium",
    estimatedBudget: raw.estimatedBudget ?? "$12,000 - $18,000",
    businessGoals: raw.businessGoals ?? (legacyFeatures.length ? legacyFeatures.slice(0, 3) : []),
    userGoals: raw.userGoals ?? [],
    nonGoals: raw.nonGoals ?? [],
    userStories: raw.userStories ?? [],
    functionalRequirements:
      raw.functionalRequirements ??
      legacyFeatures.map((f) => ({ name: f.split(" - ")[0] || f, priority: "High" as const, details: f })),
    userExperience: raw.userExperience ?? {
      entryPoint: "User lands on home screen and completes core onboarding.",
      coreSteps: ["Sign up", "Complete primary action", "Review results"],
      advancedFeatures: [],
      uiHighlights: [answers.gridSystem, answers.fontStyle, answers.colorTheme].filter(Boolean),
    },
    narrative: raw.narrative ?? raw.description ?? "",
    successMetrics: raw.successMetrics ?? {
      userCentric: [],
      business: [],
      technical: [],
      trackingPlan: [],
    },
    technicalConsiderations: raw.technicalConsiderations ?? {
      needs: [],
      integrations: [],
      privacy: [],
      scalability: [],
      challenges: legacyQuestions,
    },
    milestones: raw.milestones ?? { estimate: "2-4 weeks", teamSize: "1-2 people", phases: [] },
    documentMarkdown:
      raw.documentMarkdown ??
      `# ${raw.title ?? "Brief"}\n\n${raw.tldr ?? raw.description ?? ""}`,
    createdAt: raw.createdAt ?? new Date().toISOString(),
    originalIdea: raw.originalIdea ?? "",
    answers,
  };
}
