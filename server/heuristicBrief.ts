export function cleanAndExtractTitle(idea: string): string {
  const words = idea.trim().split(/\s+/).filter((w) => w.length > 2);
  if (words.length >= 2) {
    const cleanWords = words
      .slice(0, 3)
      .map((w) => w.replace(/[^a-zA-Z]/g, ""))
      .filter((w) => w.length > 0);
    if (cleanWords.length >= 2) {
      return cleanWords.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ") + " App";
    }
  }
  return "Custom Startup App";
}

export function buildHeuristicBrief(idea: string, answers: Record<string, string | undefined>) {
  const title = cleanAndExtractTitle(idea);
  const platform = answers?.platform || "Both";
  const auth = answers?.auth || "Email & Password";
  const integrations = answers?.integrations || "Payments";
  const grid = answers?.gridSystem || "3×3";
  const font = answers?.fontStyle || "Modern Sans";
  const theme = answers?.colorTheme || "Warm Minimal";

  let complexity: "Low" | "Medium" | "High" = "Medium";
  let estimatedBudget = "$12,000 - $18,000";
  if (answers?.platform === "Both") {
    complexity = "High";
    estimatedBudget = "$25,000 - $38,000";
  } else if (answers?.platform === "Android" || answers?.platform === "iPhone") {
    complexity = "Low";
    estimatedBudget = "$8,000 - $14,000";
  }

  const tldr = `A ${platform.toLowerCase()} product addressing: ${idea.slice(0, 120)}${idea.length > 120 ? "…" : ""}. Built with a ${theme} visual system, ${grid} grid, and ${font} typography for a clear MVP launch.`;
  const description = tldr.split(".")[0] + ".";

  const businessGoals = [
    "Launch an MVP that validates core user demand within the target timeline.",
    "Reduce ambiguity for developers and agencies with a single source-of-truth spec.",
    "Establish a scalable design system early using the chosen grid, fonts, and colors.",
  ];

  const userGoals = [
    "Complete primary tasks quickly with minimal friction on their preferred platform.",
    "Trust secure sign-in and reliable integrations for day-to-day workflows.",
    "Experience a consistent, readable interface aligned with the selected theme.",
  ];

  const nonGoals = [
    "Not a full enterprise suite in v1 — scope stays MVP-focused.",
    "No custom hardware integrations unless explicitly requested in questionnaire details.",
  ];

  const userStories = [
    `As a new user, I want to sign up via ${auth} so that I can access the product securely.`,
    `As a customer, I want ${integrations.toLowerCase()} features to work reliably so that I can complete my main task without support.`,
    `As a product owner, I want a ${grid} layout and ${font} typography so that the UI feels cohesive across screens.`,
  ];

  const functionalRequirements = [
    { name: "Core user flows", priority: "Highest" as const, details: `Primary flows for: ${idea.slice(0, 80)}` },
    { name: "Authentication", priority: "High" as const, details: `${auth} with session management and secure token storage.` },
    { name: "Integrations", priority: "High" as const, details: `${integrations} integration with error handling and retries.` },
    { name: "Design system", priority: "Medium" as const, details: `${grid} grid, ${font} fonts, ${theme} color tokens exported as CSS variables.` },
  ];

  const userExperience = {
    entryPoint: "Landing → sign up or try demo → guided onboarding for first core action.",
    coreSteps: [
      "User describes need and completes onboarding.",
      "User performs the primary value action (the app's main job-to-be-done).",
      "User receives confirmation, history, or shareable output.",
      "User returns via notifications or saved state.",
    ],
    advancedFeatures: ["Offline-friendly draft saving on mobile.", "Accessibility checks on color contrast for the chosen theme."],
    uiHighlights: [`${grid} responsive grid`, `${font} type scale`, `${theme} palette with accent CTAs`],
  };

  const narrative = `A busy founder opens the app with a rough idea in mind. Within minutes they see a clear path: sign in, follow a simple ${grid} layout, and complete the core workflow without jargon. The ${theme} theme and ${font} typography make the product feel trustworthy. They leave with a concrete plan to share with developers — not a wall of technical noise.`;

  const successMetrics = {
    userCentric: ["Weekly active users completing the core flow.", "Time-to-first-success under 5 minutes.", "In-app satisfaction score (NPS)."],
    business: ["MVP launch within stated timeline.", "Cost per acquired user within target.", "Conversion from demo to paid (if applicable)."],
    technical: ["99.5% uptime for API services.", "P95 page load under 2s on mid-range devices.", "Error rate on critical actions under 1%."],
    trackingPlan: ["Sign-ups and activation events.", "Core action completions.", "Integration failure rates."],
  };

  const technicalConsiderations = {
    needs: [`${platform} client`, "REST or GraphQL API", "Secure auth layer", "Analytics hooks"],
    integrations: [integrations, "Push notifications (optional)", "Cloud file storage if needed"],
    privacy: ["Encrypt data in transit (TLS)", "Store PII with access controls", "Clear privacy policy for auth data"],
    scalability: ["Stateless API tier", "CDN for static assets", "Background jobs for heavy tasks"],
    challenges: ["Keeping MVP scope tight", "Integration edge cases", "Consistent design tokens across platforms"],
  };

  const milestones = {
    estimate: "2–4 weeks MVP",
    teamSize: "1 designer + 1 full-stack engineer",
    phases: [
      { name: "Discovery & design tokens", duration: "3–5 days", deliverables: "Wireframes, grid/font/color system" },
      { name: "MVP build", duration: "10–14 days", deliverables: "Core flows, auth, integrations" },
      { name: "QA & launch", duration: "3–5 days", deliverables: "Testing, store/deployment, analytics" },
    ],
  };

  const documentMarkdown = `# ${title}

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
  };
}
