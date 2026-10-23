import { Screen } from "../types";

export type TourAnchorId =
  | "home.record"
  | "home.read"
  | "home.library"
  | "home.profile"
  | "home.help"
  | "nav.bar"
  | "record.mic"
  | "record.composer"
  | "read.source"
  | "library.search"
  | "profile.plan";

export interface TourStep {
  id: string;
  title: string;
  body: string;
  screen: Screen;
  /** If omitted, the card sits in the centre with no spotlight. */
  anchor?: TourAnchorId;
  placement?: "above" | "below";
}

export const TOUR_STORAGE_KEY = "founderbrief_tour_done_v1";

/** First-run walkthrough. Each step points at a real control. */
export const TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    screen: "Home",
    title: "Welcome to FounderBrief",
    body: "Speak or type an idea. We turn it into a document you can export or hear read aloud. This short tour shows you where everything lives.",
  },
  {
    id: "record-tile",
    screen: "Home",
    anchor: "home.record",
    placement: "below",
    title: "Start here",
    body: "Record is where every document begins. Tap it, then talk or type — as little or as much as you like.",
  },
  {
    id: "read-tile",
    screen: "Home",
    anchor: "home.read",
    placement: "below",
    title: "Hear it back",
    body: "Read Aloud speaks a document or pasted text. Pick a voice, then play, skip, and change speed.",
  },
  {
    id: "library-tile",
    screen: "Home",
    anchor: "home.library",
    placement: "above",
    title: "Your Library",
    body: "Every document you create and every reading you save lands here. Filter All, Documents, or Audio.",
  },
  {
    id: "profile-tile",
    screen: "Home",
    anchor: "home.profile",
    placement: "above",
    title: "You and your plan",
    body: "Profile holds your name, language, default export format, and how many free documents you have left this month.",
  },
  {
    id: "help",
    screen: "Home",
    anchor: "home.help",
    placement: "below",
    title: "Help anytime",
    body: "The ? opens a recap. You can replay this tour later from Profile → Help & Support.",
  },
  {
    id: "tabs",
    screen: "Home",
    anchor: "nav.bar",
    placement: "above",
    title: "Five tabs, always here",
    body: "Home, Record, Read Aloud, Library, Profile. The yellow circle shows where you are.",
  },
  {
    id: "record-mic",
    screen: "Record",
    anchor: "record.mic",
    placement: "below",
    title: "Talk it through",
    body: "Tap the big mic. When you are done, send the voice note and we turn your speech into text.",
  },
  {
    id: "record-type",
    screen: "Record",
    anchor: "record.composer",
    placement: "above",
    title: "Or just type",
    body: "Use this bar if you would rather write. After your idea, pick a language and a document, then answer 7 short questions — or skip and create now.",
  },
  {
    id: "read-page",
    screen: "ReadPick",
    anchor: "read.source",
    placement: "below",
    title: "What should we read?",
    body: "Paste any text, or pick a document from your Library. Then choose a voice and tap play.",
  },
  {
    id: "library-page",
    screen: "Library",
    anchor: "library.search",
    placement: "below",
    title: "Find what you made",
    body: "Search and filter once your Library fills up. Open a document, read it aloud, or delete it from the ••• menu.",
  },
  {
    id: "profile-plan",
    screen: "Profile",
    anchor: "profile.plan",
    placement: "below",
    title: "Free vs Pro",
    body: "Free includes 3 documents a month. Upgrade to Pro when you need unlimited. Language, voice, and export defaults are in the rows below.",
  },
  {
    id: "done",
    screen: "Home",
    title: "You're ready",
    body: "Go to Record and tell us the idea. We will ask a few questions, write the document, and you can export or listen. Replay this tour any time from Profile.",
  },
];
