import Constants from "expo-constants";
import * as FileSystem from "expo-file-system/legacy";
import {
  BriefAnswers,
  BriefApiResponse,
  DEFAULT_ANSWERS,
  DocumentOutputType,
  SpokenLanguage,
} from "../types";
import { getDeviceId } from "./storage";

const PRODUCTION_API = "https://founderbreif.vercel.app";

export function getApiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  const fromExtra = Constants.expoConfig?.extra?.apiUrl as string | undefined;
  return (fromExtra ?? PRODUCTION_API).replace(/\/$/, "");
}

async function apiHeaders(authToken?: string): Promise<Record<string, string>> {
  const deviceId = await getDeviceId();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Device-Id": deviceId,
  };
  if (authToken) headers.Authorization = `Bearer ${authToken}`;
  return headers;
}

export async function loginUser(
  email: string,
  password: string
): Promise<{ token: string; email: string; isAdmin: boolean; name: string }> {
  const baseUrl = getApiBaseUrl();
  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Login failed");
  return data;
}

export async function getGenerationStatus(authToken?: string): Promise<{
  isAdmin: boolean;
  used: number;
  limit: number | null;
  remaining: number | null;
}> {
  const baseUrl = getApiBaseUrl();
  const headers = await apiHeaders(authToken);
  const res = await fetch(`${baseUrl}/api/generation-status`, { headers });
  if (!res.ok) return { isAdmin: false, used: 0, limit: 3, remaining: 3 };
  return res.json();
}

export async function generateFounderBrief(
  idea: string,
  answers: BriefAnswers,
  options?: {
    prefetch?: boolean;
    authToken?: string;
    documentType?: DocumentOutputType;
    spokenLanguage?: SpokenLanguage;
  }
): Promise<BriefApiResponse> {
  const baseUrl = getApiBaseUrl();
  const deviceId = await getDeviceId();
  const headers = await apiHeaders(options?.authToken);

  const response = await fetch(`${baseUrl}/api/generate-brief`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      idea,
      answers,
      deviceId,
      prefetch: !!options?.prefetch,
      documentType: options?.documentType ?? "PRD",
      spokenLanguage: options?.spokenLanguage ?? "Urdu",
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error ?? `Request failed (${response.status})`);
  }
  return data;
}

export function startPrefetchBrief(
  idea: string,
  authToken?: string,
  documentType: DocumentOutputType = "PRD",
  spokenLanguage: SpokenLanguage = "Urdu"
): Promise<BriefApiResponse> {
  return generateFounderBrief(idea, DEFAULT_ANSWERS, {
    prefetch: true,
    authToken,
    documentType,
    spokenLanguage,
  });
}

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/api/health`);
    if (!res.ok) return false;
    const data = await res.json();
    return data.status === "ok";
  } catch {
    return false;
  }
}

function toFileUri(uri: string): string {
  if (
    uri.startsWith("file://") ||
    uri.startsWith("content://") ||
    uri.startsWith("http://") ||
    uri.startsWith("https://")
  ) {
    return uri;
  }
  return `file://${uri}`;
}

function audioMimeFromUri(uri: string): string {
  const name = uri.split("?")[0].toLowerCase();
  if (name.endsWith(".wav")) return "audio/wav";
  if (name.endsWith(".webm")) return "audio/webm";
  if (name.endsWith(".3gp") || name.endsWith(".3gpp")) return "audio/3gpp";
  if (name.endsWith(".mp3")) return "audio/mpeg";
  return "audio/mp4";
}

export async function transcribeVoiceRecording(audioUri: string): Promise<string> {
  const fileUri = toFileUri(audioUri);
  const info = await FileSystem.getInfoAsync(fileUri);
  if (!info.exists || ("size" in info && typeof info.size === "number" && info.size < 400)) {
    throw new Error("The recording file was empty. Tap the mic and try again.");
  }
  const audioBase64 = await FileSystem.readAsStringAsync(fileUri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  if (!audioBase64) {
    throw new Error("The recording file was empty. Tap the mic and try again.");
  }

  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/transcribe-voice`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      audioBase64,
      mimeType: audioMimeFromUri(fileUri),
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      typeof data.error === "string" ? data.error : `Transcription failed (${response.status})`
    );
  }
  return typeof data.text === "string" ? data.text : "";
}
