import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DEFAULT_PREFERENCES,
  ProjectBrief,
  SessionDraft,
  UserPreferences,
  UserProfile,
} from "../types";
import { normalizeBrief } from "../utils/normalizeBrief";

const BRIEFS_KEY = "founder_brief_archives";
const PROFILE_KEY = "founder_brief_user_profile";
const SESSION_KEY = "founder_brief_session_draft";
const DEVICE_ID_KEY = "founder_brief_device_id";
const PREFS_KEY = "founder_brief_preferences";
const RECENT_VOICES_KEY = "founder_brief_recent_voices";

export async function loadBriefs(): Promise<ProjectBrief[]> {
  try {
    const raw = await AsyncStorage.getItem(BRIEFS_KEY);
    const parsed: Partial<ProjectBrief>[] = raw ? JSON.parse(raw) : [];
    return parsed.map((b) => normalizeBrief(b));
  } catch {
    return [];
  }
}

export async function saveBriefs(briefs: ProjectBrief[]): Promise<void> {
  await AsyncStorage.setItem(BRIEFS_KEY, JSON.stringify(briefs));
}

export async function loadProfile(): Promise<UserProfile | null> {
  try {
    const raw = await AsyncStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function saveProfile(profile: UserProfile | null): Promise<void> {
  if (!profile) {
    await AsyncStorage.removeItem(PROFILE_KEY);
    return;
  }
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export async function loadPreferences(): Promise<UserPreferences> {
  try {
    const raw = await AsyncStorage.getItem(PREFS_KEY);
    return raw ? { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) } : DEFAULT_PREFERENCES;
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export async function savePreferences(prefs: UserPreferences): Promise<void> {
  await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

export async function loadRecentVoiceIds(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(RECENT_VOICES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveRecentVoiceIds(ids: string[]): Promise<void> {
  await AsyncStorage.setItem(RECENT_VOICES_KEY, JSON.stringify(ids));
}

export async function loadSessionDraft(): Promise<SessionDraft | null> {
  try {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Drafts written by the previous (pre-redesign) flow have no calibrationAnswers.
    if (!Array.isArray(parsed.calibrationAnswers)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function saveSessionDraft(draft: SessionDraft | null): Promise<void> {
  if (!draft) {
    await AsyncStorage.removeItem(SESSION_KEY);
    return;
  }
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(draft));
}

export async function getDeviceId(): Promise<string> {
  let id = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = `fb-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    await AsyncStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}
