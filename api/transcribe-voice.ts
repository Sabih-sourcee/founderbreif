import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleOptions, json } from "./_lib/cors";
import { transcribeAudio } from "./_lib/generateBrief";

export const config = { maxDuration: 60 };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  const { audioBase64, mimeType } = req.body ?? {};
  if (!audioBase64 || typeof audioBase64 !== "string") {
    return json(res, 400, { error: "audioBase64 is required." });
  }

  try {
    const text = await transcribeAudio(audioBase64, mimeType || "audio/mp4");
    json(res, 200, { text });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Transcription failed.";
    json(res, 500, { error: message });
  }
}
