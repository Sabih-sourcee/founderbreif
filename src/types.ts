/**
 * Types and constants for FounderBrief Dual-Direction Voice-Document Platform (Web).
 */

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

export interface VoiceProfile {
  id: string;
  name: string;
  language: SpokenLanguage;
  nativeTag: string;
  accentLabel: string;
  style: string;
  isPremium: boolean;
  pitch: number;
  baseRate: number;
  avatarBg: string;
}

export const DOCUMENT_OUTPUT_TYPES: Array<{
  id: DocumentOutputType;
  label: string;
  shortLabel: string;
  tagline: string;
  badge: string;
}> = [
  {
    id: "PRD",
    label: "PRD",
    shortLabel: "PRD",
    tagline: "Product specs, MVP scope & dev milestones",
    badge: "SPEC",
  },
  {
    id: "Business Plan",
    label: "Business Plan",
    shortLabel: "Biz Plan",
    tagline: "Market wedge, unit economics & 12m roadmap",
    badge: "PLAN",
  },
  {
    id: "Resume",
    label: "Resume",
    shortLabel: "Resume",
    tagline: "Founder bio, venture track record & impact",
    badge: "CV",
  },
  {
    id: "Pitch Deck Outline",
    label: "Pitch Deck Outline",
    shortLabel: "Pitch Deck",
    tagline: "10-slide investor narrative & seed ask",
    badge: "DECK",
  },
  {
    id: "Generic Brief",
    label: "Generic Brief",
    shortLabel: "Brief",
    tagline: "Clean executive summary & action items",
    badge: "BRIEF",
  },
];

export const SPOKEN_LANGUAGES: Array<{
  id: SpokenLanguage;
  label: string;
  nativeScript: string;
  samplePrompt: string;
}> = [
  {
    id: "Urdu",
    label: "Urdu",
    nativeScript: "اردو",
    samplePrompt:
      "Mera idea ek hyper-local kiryana aur pharmacy delivery app hai Lahore aur Karachi ke liye jisme Rider live tracking, Cash-on-Delivery wallet, aur WhatsApp voice order receipt ho.",
  },
  {
    id: "Hindi",
    label: "Hindi",
    nativeScript: "हिन्दी",
    samplePrompt:
      "Hum tier-2 cities ke SMB merchants ke liye ek GST billing aur inventory voice assistant bana rahe hain jo UPI auto-reconciliation aur regional language reminders bhejta hai.",
  },
  {
    id: "Arabic",
    label: "Arabic",
    nativeScript: "العربية",
    samplePrompt:
      "منصة لوجستية ذكية للمطاعم السحابية في الرياض ودبي مع تتبع فوري للسائقين وإدارة المخزون والفواتير الإلكترونية.",
  },
  {
    id: "English",
    label: "English",
    nativeScript: "EN",
    samplePrompt:
      "A B2B SaaS platform for independent clinic & pharmacy owners across South Asia and MENA to manage inventory, automated supplier re-orders, and WhatsApp patient reminders.",
  },
];

export const VOZIFY_VOICES: VoiceProfile[] = [
  {
    id: "voice-zain-ur",
    name: "Zainab (Karachi)",
    language: "Urdu",
    nativeTag: "اردو",
    accentLabel: "Pakistani Urdu • Warm Clear",
    style: "Founder Narrator",
    isPremium: false,
    pitch: 1.05,
    baseRate: 1.0,
    avatarBg: "#DAF7F3",
  },
  {
    id: "voice-hamza-ur",
    name: "Hamza Studio HD",
    language: "Urdu",
    nativeTag: "اردو",
    accentLabel: "Lahore Executive • Deep Neural",
    style: "Boardroom Pitch",
    isPremium: true,
    pitch: 0.92,
    baseRate: 1.0,
    avatarBg: "#FBFF28",
  },
  {
    id: "voice-aarav-hi",
    name: "Aarav (Mumbai)",
    language: "Hindi",
    nativeTag: "हिन्दी",
    accentLabel: "Hindi / Hinglish • Crisp",
    style: "Product Storyteller",
    isPremium: false,
    pitch: 0.98,
    baseRate: 1.0,
    avatarBg: "#DAF7F3",
  },
  {
    id: "voice-ananya-hi",
    name: "Ananya Neural Pro",
    language: "Hindi",
    nativeTag: "हिन्दी",
    accentLabel: "Delhi Studio • Expressive",
    style: "Keynote Deck",
    isPremium: true,
    pitch: 1.08,
    baseRate: 1.0,
    avatarBg: "#FBFF28",
  },
  {
    id: "voice-layla-ar",
    name: "Layla (Dubai)",
    language: "Arabic",
    nativeTag: "العربية",
    accentLabel: "Gulf Arabic • Articulate",
    style: "Executive Brief",
    isPremium: false,
    pitch: 1.04,
    baseRate: 1.0,
    avatarBg: "#DAF7F3",
  },
  {
    id: "voice-tariq-ar",
    name: "Tariq Neural HD",
    language: "Arabic",
    nativeTag: "العربية",
    accentLabel: "Riyadh Venture • Resonant",
    style: "Investor Memo",
    isPremium: true,
    pitch: 0.9,
    baseRate: 1.0,
    avatarBg: "#FBFF28",
  },
  {
    id: "voice-ayaan-en",
    name: "Ayaan (South Asian EN)",
    language: "English",
    nativeTag: "EN",
    accentLabel: "South Asian English • Natural",
    style: "CTO Spec Reader",
    isPremium: false,
    pitch: 1.0,
    baseRate: 1.0,
    avatarBg: "#DAF7F3",
  },
  {
    id: "voice-sara-en",
    name: "Sara Ultra Neural",
    language: "English",
    nativeTag: "EN",
    accentLabel: "Global Founder • Studio HD",
    style: "YC Pitch Narrator",
    isPremium: true,
    pitch: 1.06,
    baseRate: 1.0,
    avatarBg: "#FBFF28",
  },
];

export interface BriefAnswers {
  platform: "Android" | "iPhone" | "Both";
  platformDetails: string;
  auth: string;
  authDetails: string;
  integrations: string;
  integrationsDetails: string;
  design: string;
  designDetails: string;
  timeline: string;
  timelineDetails: string;
}

export interface ProjectBrief {
  id: string;
  title: string;
  description: string;
  complexity: "Low" | "Medium" | "High";
  estimatedBudget: string;
  coreFeatures: string[];
  userStories: string[];
  devQuestions: string[];
  createdAt: string;
  originalIdea: string;
  answers: BriefAnswers;
  documentMarkdown?: string;
  documentType?: DocumentOutputType;
  direction?: LibraryDirection;
  spokenLanguage?: SpokenLanguage;
  voiceId?: string;
  playbackSpeed?: number;
  audioFormat?: ExportAudioFormat;
}

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl?: string;
  companyName?: string;
  isLoggedIn: boolean;
  isPro?: boolean;
}
