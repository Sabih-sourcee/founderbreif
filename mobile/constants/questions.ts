import { DocumentOutputType } from "../types";

/**
 * Calibration question sets. Each document type has its own 7 questions
 * (a PRD asks different things than a Resume or a Pitch Deck).
 */
export const CALIBRATION_QUESTIONS: Record<DocumentOutputType, string[]> = {
  PRD: [
    "What problem does your product solve, in one sentence?",
    "Which platform should version 1 launch on: Android, iPhone, or both?",
    "Who is your target customer?",
    "What are the three must-have features for launch?",
    "How will users sign in and pay, or will it be free?",
    "Which tools or integrations does it need (payments, maps, WhatsApp, AI)?",
    "What is your target launch timeline and budget range?",
  ],
  "Business Plan": [
    "What business are you starting, and what do you sell?",
    "Who is your target customer?",
    "How will you make money (pricing and revenue model)?",
    "Who are your main competitors, and how are you different?",
    "How will you reach your first 100 customers?",
    "What are your expected startup costs and monthly expenses?",
    "What does success look like 12 months from now?",
  ],
  Resume: [
    "What is your full name and the role you are targeting?",
    "Summarize your professional background in two sentences.",
    "What are your most recent roles, companies, and dates?",
    "Which achievements are you proudest of (add numbers if you can)?",
    "Which skills and tools should be highlighted?",
    "What is your education, and do you have any certifications?",
    "Any languages, awards, or links (LinkedIn, portfolio) to include?",
  ],
  "Pitch Deck Outline": [
    "What is the one-line pitch for your startup?",
    "What problem are you solving, and for whom?",
    "What is your solution, and why is now the right time?",
    "How big is the market you are going after?",
    "What traction do you have so far (users, revenue, pilots)?",
    "Who is on the team, and why are you the right people?",
    "How much are you raising, and what will you use it for?",
  ],
  "Generic Brief": [
    "What is this brief about, in one sentence?",
    "Who is the audience for this brief?",
    "What outcome do you want after they read it?",
    "What key facts or decisions must be covered?",
    "What constraints (budget, time, risks) matter?",
    "Who owns the next steps?",
    "What is the deadline or next milestone?",
  ],
};

/** Section heading used in the generated document for each calibration answer. */
export const SECTION_TITLES: Record<DocumentOutputType, string[]> = {
  PRD: [
    "Problem Statement",
    "Platform",
    "Target Users",
    "Core Features",
    "Accounts & Payments",
    "Integrations",
    "Timeline & Budget",
  ],
  "Business Plan": [
    "Business Overview",
    "Target Customer",
    "Revenue Model",
    "Competition",
    "Go-To-Market",
    "Costs & Funding",
    "12-Month Outlook",
  ],
  Resume: [
    "Profile",
    "Summary",
    "Experience",
    "Key Achievements",
    "Skills",
    "Education",
    "Additional Information",
  ],
  "Pitch Deck Outline": [
    "One-Line Pitch",
    "Problem",
    "Solution & Timing",
    "Market Size",
    "Traction",
    "Team",
    "The Ask",
  ],
  "Generic Brief": [
    "Overview",
    "Audience",
    "Desired Outcome",
    "Key Facts & Decisions",
    "Constraints",
    "Owners & Next Steps",
    "Deadline",
  ],
};

export function getQuestions(docType: DocumentOutputType): string[] {
  return CALIBRATION_QUESTIONS[docType] ?? CALIBRATION_QUESTIONS.PRD;
}
