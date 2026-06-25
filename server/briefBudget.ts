export interface BudgetLineItem {
  item: string;
  cost: string;
  notes?: string;
}

export interface CalculationLine {
  item: string;
  calculation: string;
}

const ENTERPRISE_PATTERN =
  /\b(daraz|amazon|flipkart|uber|airbnb|netflix|facebook|marketplace|multi[- ]vendor|e[- ]?commerce platform|millions of users|nationwide|global scale|enterprise saas)\b/i;

export function isEnterpriseScaleIdea(idea: string): boolean {
  return ENTERPRISE_PATTERN.test(idea);
}

function parseLargestUsdAmount(value: string): number | null {
  const nums = value.replace(/,/g, "").match(/\d+(?:\.\d+)?/g);
  if (!nums?.length) return null;
  return Math.max(...nums.map(Number));
}

export function budgetCapUsd(idea: string, buildPath: string): number {
  const enterprise = isEnterpriseScaleIdea(idea);
  if (buildPath === "AI-assisted build") return enterprise ? 400 : 250;
  if (buildPath === "Build myself (I code)") return enterprise ? 800 : 200;
  return enterprise ? 10_000 : 1_000;
}

export function budgetForBuildPath(
  buildPath: string,
  platform: string,
  idea = ""
): {
  total: string;
  breakdown: BudgetLineItem[];
  calculationBreakdown: CalculationLine[];
  complexity: "Low" | "Medium" | "High";
} {
  const enterprise = isEnterpriseScaleIdea(idea);
  const isBoth = platform === "Both";
  const needsApple = platform !== "Android";
  const needsGoogle = platform !== "iPhone";

  if (buildPath === "Hire freelancers") {
    const total = enterprise
      ? isBoth
        ? "$6,000 – $10,000"
        : "$4,000 – $8,000"
      : isBoth
        ? "$800 – $1,000"
        : "$400 – $800";
    const breakdown: BudgetLineItem[] = enterprise
      ? [
          { item: "UI/UX design", cost: "$800 – $1,500" },
          { item: "Mobile apps", cost: isBoth ? "$2,500 – $4,500" : "$1,200 – $2,500" },
          { item: "Backend + admin", cost: "$1,500 – $3,000" },
          { item: "QA + launch", cost: "$500 – $1,500" },
        ]
      : [
          { item: "UI/UX design", cost: "$150 – $300" },
          { item: "App development", cost: isBoth ? "$350 – $500" : "$200 – $400" },
          { item: "Backend setup", cost: "$100 – $200" },
          { item: "QA + fixes", cost: "$50 – $100" },
        ];
  const calculationBreakdown: CalculationLine[] = breakdown.map((b) => ({
      item: b.item,
      calculation: enterprise
        ? "Upwork/Fiverr fixed-price quotes for marketplace-scale scope (capped at $10k total)."
        : "Typical MVP freelance rates: $15–$35/hr × 15–40 hrs per workstream.",
    }));
    return { total, breakdown, calculationBreakdown, complexity: enterprise ? "High" : isBoth ? "Medium" : "Low" };
  }

  if (buildPath === "Build myself (I code)") {
    const total = enterprise ? "$120 – $800" : "$35 – $150";
    const breakdown: BudgetLineItem[] = [
      ...(needsGoogle ? [{ item: "Google Play developer", cost: "$25" }] : []),
      ...(needsApple ? [{ item: "Apple Developer Program", cost: "$99/yr" }] : []),
      { item: "Supabase (backend + DB)", cost: "$0 – $25/mo" },
      { item: "Hosting / deploy (Vercel or EAS)", cost: "$0 – $20/mo" },
      { item: "Domain (optional)", cost: "$12/yr" },
      { item: "AI API usage (if any)", cost: "$0 – $15/mo" },
    ];
    const calculationBreakdown: CalculationLine[] = [
      { item: "Scope", calculation: "Founder writes all code — budget is infra + store fees only, no salaries." },
      { item: "Supabase", calculation: "Free tier for MVP; Pro $25/mo if you exceed free limits." },
      { item: "Hosting", calculation: "Vercel Hobby $0 or EAS free tier; paid tiers only if traffic grows." },
    ];
    return { total, breakdown, calculationBreakdown, complexity: enterprise ? "Medium" : "Low" };
  }

  // AI-assisted build
  const total = enterprise ? "$150 – $400" : "$45 – $180";
  const breakdown: BudgetLineItem[] = [
    { item: "Cursor Pro", cost: "$20/mo" },
    { item: "Supabase", cost: "$0 – $25/mo" },
    ...(platform === "Web" || isBoth ? [{ item: "Vercel", cost: "$0 – $20/mo" }] : []),
    ...(isBoth || platform !== "Web" ? [{ item: "Expo EAS", cost: "$0 – $29/mo" }] : []),
    { item: "Gemini API", cost: "$0 – $20/mo" },
    ...(needsGoogle ? [{ item: "Google Play", cost: "$25" }] : []),
    ...(needsApple ? [{ item: "Apple Developer", cost: "$99/yr" }] : []),
  ];
  const calculationBreakdown: CalculationLine[] = [
    { item: "Cursor Pro", calculation: "$20/mo × 2–3 month MVP sprint ≈ $40–$60" },
    { item: "Supabase", calculation: "Free tier $0; Pro $25/mo only if DB/auth limits hit" },
    { item: "Vercel / EAS", calculation: "Hobby/free tiers $0; upgrade only for production scale" },
    { item: "Gemini API", calculation: "~$0–$20/mo for light MVP traffic (pay-per-token)" },
    {
      item: "Store fees",
      calculation: needsGoogle && needsApple ? "Google $25 one-time + Apple $99/yr" : needsApple ? "Apple $99/yr" : "Google Play $25 one-time",
    },
    { item: "Total rule", calculation: "Subscriptions + fees only — no developer salaries or agency costs." },
  ];
  return { total, breakdown, calculationBreakdown, complexity: enterprise ? "Medium" : "Low" };
}

export function sanitizeBriefBudget<T extends Record<string, unknown>>(
  brief: T,
  idea: string,
  answers: Record<string, string | undefined>
): T {
  const buildPath = answers.buildPath || "AI-assisted build";
  const cap = budgetCapUsd(idea, buildPath);
  const parsed = parseLargestUsdAmount(String(brief.estimatedBudget ?? ""));
  const fallback = budgetForBuildPath(buildPath, answers.platform || "Both", idea);

  let next = { ...brief };

  if (parsed === null || parsed > cap || parsed > 10_000) {
    next = {
      ...next,
      estimatedBudget: fallback.total,
      budgetBreakdown: fallback.breakdown,
      calculationBreakdown: fallback.calculationBreakdown,
      complexity: fallback.complexity,
    };
  }

  if (Array.isArray(next.budgetBreakdown)) {
    next.budgetBreakdown = (next.budgetBreakdown as BudgetLineItem[]).map(({ item, cost }) => ({
      item,
      cost,
    }));
  }

  if (!Array.isArray(next.calculationBreakdown) || (next.calculationBreakdown as CalculationLine[]).length === 0) {
    next.calculationBreakdown = fallback.calculationBreakdown;
  }

  const finalParsed = parseLargestUsdAmount(String(next.estimatedBudget ?? ""));
  if (finalParsed !== null && finalParsed > 10_000) {
    next.estimatedBudget = "$1,000";
  }

  return next;
}
