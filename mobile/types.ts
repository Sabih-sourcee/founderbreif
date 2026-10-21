export type DocumentOutputType =
  | "PRD"
  | "Business Plan"
  | "Resume"
  | "Pitch Deck Outline"
  | "Generic Brief";

export type SpokenLanguage = "Urdu" | "Hindi" | "Arabic" | "English";

export type LibraryDirection = "voice-to-doc" | "doc-to-voice";

export type ExportDocFormat = "Word" | "PDF" | "TXT";
export type ExportAudioFormat = "MP3" | "AAC" | "WAV";

export type VoiceGender = "Female" | "Male";

export interface VoiceProfile {
  id: string;
  name: string;
  language: SpokenLanguage;
  /** BCP-47 locale handed to the on-device TTS engine. */
  locale: string;
  region: string;
  gender: VoiceGender;
  /** Premium voices are locked (Crown icon) until the user is on Pro. */
  isPremium: boolean;
  pitch: number;
}

export const DOCUMENT_OUTPUT_TYPES: Array<{
  id: DocumentOutputType;
  label: string;
  /** Used in the result top bar: "Your {barLabel}". */
  barLabel: string;
  shortLabel: string;
  tagline: string;
}> = [
  {
    id: "PRD",
    label: "PRD",
    barLabel: "PRD",
    shortLabel: "PRD",
    tagline: "Product specs, MVP scope & milestones",
  },
  {
    id: "Business Plan",
    label: "Business Plan",
    barLabel: "Business Plan",
    shortLabel: "Business Plan",
    tagline: "Market, unit economics & 12-month roadmap",
  },
  {
    id: "Resume",
    label: "Resume",
    barLabel: "Resume",
    shortLabel: "Resume",
    tagline: "Bio, track record & impact",
  },
  {
    id: "Pitch Deck Outline",
    label: "Pitch Deck Outline",
    barLabel: "Pitch Deck",
    shortLabel: "Pitch Deck",
    tagline: "10-slide investor narrative & ask",
  },
  {
    id: "Generic Brief",
    label: "Generic Brief",
    barLabel: "Brief",
    shortLabel: "Brief",
    tagline: "Clean summary & action items",
  },
];

export const SPOKEN_LANGUAGES: Array<{
  id: SpokenLanguage;
  label: string;
  code: string;
  /** Short line spoken when previewing a voice. */
  previewLine: string;
}> = [
  {
    id: "Urdu",
    label: "Urdu",
    code: "ur",
    previewLine: "السلام علیکم، میں آپ کی دستاویز پڑھ کر سناؤں گی۔",
  },
  {
    id: "Hindi",
    label: "Hindi",
    code: "hi",
    previewLine: "नमस्ते, मैं आपका दस्तावेज़ पढ़कर सुनाऊँगी।",
  },
  {
    id: "Arabic",
    label: "Arabic",
    code: "ar",
    previewLine: "مرحباً، سأقرأ لك مستندك بصوت واضح.",
  },
  {
    id: "English",
    label: "English",
    code: "en",
    previewLine: "Hi, I will read your document aloud for you.",
  },
];

/** Voice catalogue. Free vs premium is enforced against the user's real plan tier. */
export const VOICES: VoiceProfile[] = [
  {
    id: "voice-amina-ur",
    name: "Amina",
    language: "Urdu",
    locale: "ur-PK",
    region: "Pakistan",
    gender: "Female",
    isPremium: false,
    pitch: 1.08,
  },
  {
    id: "voice-usman-ur",
    name: "Usman",
    language: "Urdu",
    locale: "ur-PK",
    region: "Pakistan",
    gender: "Male",
    isPremium: true,
    pitch: 0.88,
  },
  {
    id: "voice-aarav-hi",
    name: "Aarav",
    language: "Hindi",
    locale: "hi-IN",
    region: "India",
    gender: "Male",
    isPremium: false,
    pitch: 0.92,
  },
  {
    id: "voice-ananya-hi",
    name: "Ananya",
    language: "Hindi",
    locale: "hi-IN",
    region: "India",
    gender: "Female",
    isPremium: true,
    pitch: 1.1,
  },
  {
    id: "voice-layla-ar",
    name: "Layla",
    language: "Arabic",
    locale: "ar-AE",
    region: "UAE",
    gender: "Female",
    isPremium: false,
    pitch: 1.06,
  },
  {
    id: "voice-tariq-ar",
    name: "Tariq",
    language: "Arabic",
    locale: "ar-SA",
    region: "Saudi Arabia",
    gender: "Male",
    isPremium: true,
    pitch: 0.86,
  },
  {
    id: "voice-sana-en",
    name: "Sana",
    language: "English",
    locale: "en-IN",
    region: "Pakistan",
    gender: "Female",
    isPremium: false,
    pitch: 1.08,
  },
  {
    id: "voice-ayaan-en",
    name: "Ayaan",
    language: "English",
    locale: "en-IN",
    region: "India",
    gender: "Male",
    isPremium: false,
    pitch: 0.9,
  },
  {
    id: "voice-sara-en",
    name: "Sara",
    language: "English",
    locale: "en-US",
    region: "United States",
    gender: "Female",
    isPremium: true,
    pitch: 1.04,
  },
];

export interface CalibrationAnswer {
  question: string;
  answer: string;
}

/**
 * Legacy "answers" payload still consumed by the generation API / heuristic
 * fallback. The new calibration flow sends its real Q&A in `calibration`.
 */
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
  calibration?: CalibrationAnswer[];
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
  documentType?: DocumentOutputType;
  spokenLanguage?: SpokenLanguage;
}

export interface ProjectBrief extends BriefApiResponse {
  id: string;
  createdAt: string;
  originalIdea: string;
  answers: BriefAnswers;
  documentType: DocumentOutputType;
  direction: LibraryDirection;
  spokenLanguage: SpokenLanguage;
  voiceId?: string;
  playbackSpeed?: number;
  audioFormat?: ExportAudioFormat;
  /** Estimated/actual read-aloud duration in seconds (audio items). */
  durationSec?: number;
}

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl?: string;
  companyName?: string;
  isLoggedIn: boolean;
  isAdmin?: boolean;
  isPro?: boolean;
  authToken?: string;
}

export interface UserPreferences {
  language: SpokenLanguage;
  voiceId?: string;
  docFormat: ExportDocFormat;
  audioFormat: ExportAudioFormat;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  language: "English",
  docFormat: "TXT",
  audioFormat: "MP3",
};

export interface SessionDraft {
  idea: string;
  /** One answer per calibration question answered so far. */
  calibrationAnswers: string[];
  step: number;
  inProgress: boolean;
  documentType?: DocumentOutputType;
  spokenLanguage?: SpokenLanguage;
  updatedAt: string;
}

export type Screen =
  | "Home"
  | "Record"
  | "Questions"
  | "Result"
  | "ReadPick"
  | "VoiceSelect"
  | "Player"
  | "Library"
  | "Profile";

export type TabId = "Home" | "Record" | "ReadAloud" | "Library" | "Profile";

export const DEFAULT_ANSWERS: BriefAnswers = {
  platform: "Both",
  platformDetails: "",
  auth: "Email & Password",
  authDetails: "",
  integrations: "Payments",
  integrationsDetails: "",
  gridSystem: "3×3",
  fontStyle: "Inter",
  colorTheme: "Teal & Yellow",
  timeline: "Full Release (3-6 months)",
  timelineDetails: "",
};
