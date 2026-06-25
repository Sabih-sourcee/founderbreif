import { GoogleGenAI } from "@google/genai";
import { BRIEF_RESPONSE_SCHEMA, buildBriefPrompt, getBriefSystemInstruction } from "../../server/briefSchema";
import { sanitizeBriefBudget } from "../../server/briefBudget";
import { buildHeuristicBrief } from "../../server/heuristicBrief";
import { appGeminiKey } from "./env";

export async function generateBrief(idea: string, answers: Record<string, string | undefined> = {}) {
  const apiKey = appGeminiKey();
  if (!apiKey) {
    return buildHeuristicBrief(idea, answers);
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: buildBriefPrompt(idea, answers),
      config: {
        systemInstruction: getBriefSystemInstruction(),
        responseMimeType: "application/json",
        responseSchema: BRIEF_RESPONSE_SCHEMA,
      },
    });
    const parsed = JSON.parse(response.text || "{}");
    return sanitizeBriefBudget(parsed, idea, answers);
  } catch (error) {
    console.error("Gemini failed, using heuristic:", error);
    return buildHeuristicBrief(idea, answers);
  }
}

export async function transcribeAudio(base64: string, mimeType: string) {
  const apiKey = appGeminiKey();
  if (!apiKey) throw new Error("APP_GEMINI_API_KEY is not configured.");

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          { inlineData: { mimeType, data: base64 } },
          {
            text: `Transcribe the founder's spoken startup product idea from this audio.
Return ONLY the transcription as plain text — no labels, no commentary.
Preserve mixed languages if spoken.`,
          },
        ],
      },
    ],
  });

  const text = response.text?.trim();
  if (!text) throw new Error("Could not transcribe audio.");
  return text.slice(0, 500);
}
