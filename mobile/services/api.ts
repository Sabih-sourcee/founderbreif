import Constants from "expo-constants";
import { BriefAnswers, BriefApiResponse, DEFAULT_ANSWERS } from "../types";
import { getDeviceId } from "./storage";

export function getApiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  const fromExtra = Constants.expoConfig?.extra?.apiUrl as string | undefined;
  return (fromExtra ?? "http://localhost:3000").replace(/\/$/, "");
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
  if (!res.ok) return { isAdmin: false, used: 0, limit: 1, remaining: 1 };
  return res.json();
}

export async function generateFounderBrief(
  idea: string,
  answers: BriefAnswers,
  options?: { prefetch?: boolean; authToken?: string }
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
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error ?? `Request failed (${response.status})`);
  }
  return data;
}

export function startPrefetchBrief(idea: string, authToken?: string): Promise<BriefApiResponse> {
  return generateFounderBrief(idea, DEFAULT_ANSWERS, { prefetch: true, authToken });
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

export async function transcribeVoiceRecording(audioUri: string): Promise<string> {
  const formData = new FormData();
  const filename = audioUri.split("/").pop() ?? "recording.m4a";
  formData.append("audio", {
    uri: audioUri,
    name: filename,
    type: "audio/mp4",
  } as unknown as Blob);

  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/transcribe-voice`, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error ?? `Transcription failed (${response.status})`);
  }
  return data.text as string;
}
