export interface BriefAnswers {
  platform: "Android" | "iPhone" | "Both";
  platformDetails: string;
  auth: string;
  authDetails: string;
  integrations: string;
  integrationsDetails: string;
  gridSystem: "3×3" | "3×4" | "1×2";
  fontStyle: string;
  colorTheme: string;
  timeline: string;
  timelineDetails: string;
}

export interface FunctionalRequirement {
  name: string;
  priority: "Highest" | "High" | "Medium";
  details: string;
}

export interface UserExperienceSection {
  entryPoint: string;
  coreSteps: string[];
  advancedFeatures: string[];
  uiHighlights: string[];
}

export interface SuccessMetrics {
  userCentric: string[];
  business: string[];
  technical: string[];
  trackingPlan: string[];
}

export interface TechnicalConsiderations {
  needs: string[];
  integrations: string[];
  privacy: string[];
  scalability: string[];
  challenges: string[];
}

export interface MilestonePhase {
  name: string;
  duration: string;
  deliverables: string;
}

export interface Milestones {
  estimate: string;
  teamSize: string;
  phases: MilestonePhase[];
}

export interface BriefApiResponse {
  title: string;
  tldr: string;
  description: string;
  complexity: "Low" | "Medium" | "High";
  estimatedBudget: string;
  businessGoals: string[];
  userGoals: string[];
  nonGoals: string[];
  userStories: string[];
  functionalRequirements: FunctionalRequirement[];
  userExperience: UserExperienceSection;
  narrative: string;
  successMetrics: SuccessMetrics;
  technicalConsiderations: TechnicalConsiderations;
  milestones: Milestones;
  documentMarkdown: string;
}

export interface ProjectBrief extends BriefApiResponse {
  id: string;
  createdAt: string;
  originalIdea: string;
  answers: BriefAnswers;
}

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl?: string;
  companyName?: string;
  isLoggedIn: boolean;
  isAdmin?: boolean;
  authToken?: string;
}

export interface SessionDraft {
  idea: string;
  answers: BriefAnswers;
  step: number;
  inProgress: boolean;
  updatedAt: string;
}

export type Tab =
  | "Landing"
  | "Input"
  | "Questions"
  | "Result"
  | "History"
  | "Profile";

export const DEFAULT_ANSWERS: BriefAnswers = {
  platform: "Both",
  platformDetails: "",
  auth: "Email & Password",
  authDetails: "",
  integrations: "Payments",
  integrationsDetails: "",
  gridSystem: "3×3",
  fontStyle: "Modern Sans (Inter / Geist)",
  colorTheme: "Warm Minimal (cream & orange)",
  timeline: "Full Release (3-6 months)",
  timelineDetails: "",
};

export const GRID_OPTIONS: BriefAnswers["gridSystem"][] = ["3×3", "3×4", "1×2"];

export const FONT_OPTIONS = [
  "Modern Sans (Inter / Geist)",
  "Editorial Serif (Playfair + Source Sans)",
  "Playful Rounded (Nunito / Quicksand)",
];

export const COLOR_THEME_OPTIONS = [
  "Warm Minimal (cream & orange)",
  "Dark Pro (navy & teal)",
  "Bold Startup (violet & coral)",
];
