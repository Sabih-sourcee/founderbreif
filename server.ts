import express from "express";
import path from "path";
import crypto from "crypto";
import multer from "multer";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { BRIEF_RESPONSE_SCHEMA, buildBriefPrompt, DocumentOutputType } from "./server/briefSchema";
import { buildHeuristicBrief } from "./server/heuristicBrief";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
// Free tier: 3 generations/reads per month (Pro $18/mo or $139/yr is unlimited)
const FREE_GENERATION_LIMIT = 3;

interface AuthSession {
  email: string;
  isAdmin: boolean;
  name: string;
}

const authSessions = new Map<string, AuthSession>();
const deviceGenerationCounts = new Map<string, number>();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Device-Id");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.use(express.json());

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
});

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

function resolveAuthSession(req: express.Request): AuthSession | null {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return null;
  return authSessions.get(token) ?? null;
}

function canGenerate(
  req: express.Request,
  body: { deviceId?: string; prefetch?: boolean }
): { ok: boolean; error?: string } {
  const session = resolveAuthSession(req);
  if (session?.isAdmin) return { ok: true };

  if (body.prefetch) return { ok: true };

  const deviceId = body.deviceId || req.headers["x-device-id"];
  if (!deviceId || typeof deviceId !== "string") {
    return { ok: false, error: "Device ID required for generation tracking." };
  }

  const used = deviceGenerationCounts.get(deviceId) ?? 0;
  if (used >= FREE_GENERATION_LIMIT) {
    return {
      ok: false,
      error:
        "Free tier limit reached (3 generations/reads per month). Upgrade to FounderBrief Pro ($18/mo or $139/yr) for unlimited Voice → Doc generations, neural TTS Read Aloud voices, and all export formats.",
    };
  }
  return { ok: true };
}

function recordGeneration(req: express.Request, body: { deviceId?: string; prefetch?: boolean }) {
  const session = resolveAuthSession(req);
  if (session?.isAdmin || body.prefetch) return;

  const deviceId = body.deviceId || req.headers["x-device-id"];
  if (typeof deviceId === "string") {
    deviceGenerationCounts.set(deviceId, (deviceGenerationCounts.get(deviceId) ?? 0) + 1);
  }
}

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body ?? {};
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  if (
    adminEmail &&
    adminPassword &&
    String(email).trim().toLowerCase() === adminEmail &&
    password === adminPassword
  ) {
    const token = crypto.randomUUID();
    const session: AuthSession = {
      email: String(email).trim().toLowerCase(),
      isAdmin: true,
      name: "Founder Pro",
    };
    authSessions.set(token, session);
    return res.json({
      token,
      email: session.email,
      isAdmin: true,
      name: session.name,
    });
  }

  return res.status(401).json({ error: "Invalid email or password." });
});

app.get("/api/auth/me", (req, res) => {
  const session = resolveAuthSession(req);
  if (!session) return res.status(401).json({ error: "Not authenticated." });
  res.json(session);
});

app.get("/api/generation-status", (req, res) => {
  const session = resolveAuthSession(req);
  if (session?.isAdmin) {
    return res.json({ isAdmin: true, remaining: null, used: 0, limit: null });
  }
  const deviceId = req.headers["x-device-id"];
  if (typeof deviceId !== "string") {
    return res.json({
      isAdmin: false,
      remaining: FREE_GENERATION_LIMIT,
      used: 0,
      limit: FREE_GENERATION_LIMIT,
    });
  }
  const used = deviceGenerationCounts.get(deviceId) ?? 0;
  res.json({
    isAdmin: false,
    used,
    limit: FREE_GENERATION_LIMIT,
    remaining: Math.max(0, FREE_GENERATION_LIMIT - used),
  });
});

// Endpoint to generate document (PRD, Business Plan, Resume, Pitch Deck Outline, Generic Brief)
app.post("/api/generate-brief", async (req, res) => {
  const {
    idea,
    answers,
    deviceId,
    prefetch,
    documentType = "PRD",
    spokenLanguage = "Auto (Urdu / Hindi / Arabic / English)",
  } = req.body ?? {};

  if (!idea) {
    return res.status(400).json({ error: "Voice note or text input is required." });
  }

  const validDocType: DocumentOutputType = [
    "PRD",
    "Business Plan",
    "Resume",
    "Pitch Deck Outline",
    "Generic Brief",
  ].includes(documentType)
    ? documentType
    : "PRD";

  const gate = canGenerate(req, { deviceId, prefetch: !!prefetch });
  if (!gate.ok) {
    return res.status(403).json({ error: gate.error });
  }

  try {
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not configured. Using heuristic document builder.");
      const fallbackBrief = buildHeuristicBrief(idea, answers ?? {}, validDocType, spokenLanguage);
      if (!prefetch) recordGeneration(req, { deviceId, prefetch: false });
      return res.json(fallbackBrief);
    }

    const prompt = buildBriefPrompt(idea, answers ?? {}, validDocType, spokenLanguage);

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction:
          "You are an elite startup advisor and document architect for non-technical South Asian and global founders. Handle Urdu, Hindi, Arabic, and English inputs effortlessly. Output valid JSON matching the schema. The documentMarkdown must be a complete, export-ready document in Markdown with ## section headers.",
        responseMimeType: "application/json",
        responseSchema: BRIEF_RESPONSE_SCHEMA,
      },
    });

    const parsedResponse = JSON.parse(response.text || "{}");
    if (!prefetch) recordGeneration(req, { deviceId, prefetch: false });
    res.json({
      ...parsedResponse,
      documentType: validDocType,
      spokenLanguage,
    });
  } catch (error: unknown) {
    console.error("Gemini generation failed, using heuristic fallback:", error);
    const fallbackBrief = buildHeuristicBrief(idea, answers ?? {}, validDocType, spokenLanguage);
    if (!prefetch) recordGeneration(req, { deviceId, prefetch: false });
    res.json(fallbackBrief);
  }
});

// Transcribe voice note → text for mobile/web mic input (Urdu / Hindi / Arabic / English)
app.post("/api/transcribe-voice", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file?.buffer?.length) {
      return res.status(400).json({ error: "Audio recording is required." });
    }

    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
    }

    const mimeType = req.file.mimetype || "audio/mp4";
    const base64 = req.file.buffer.toString("base64");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: { mimeType, data: base64 },
            },
            {
              text: `Transcribe the founder's spoken voice note from this audio.
Return ONLY the transcription as plain text — no labels, no commentary.
Preserve mixed languages (Urdu اردو, Hindi हिन्दी, Arabic العربية, Roman Urdu, Hinglish, and English code-switching) accurately.`,
            },
          ],
        },
      ],
    });

    const text = response.text?.trim();
    if (!text) {
      return res
        .status(502)
        .json({ error: "Could not transcribe audio. Please try again or type your note." });
    }

    res.json({ text: text.slice(0, 1500) });
  } catch (error: unknown) {
    console.error("Voice transcription failed:", error);
    const status =
      error && typeof error === "object" && "status" in error
        ? Number((error as { status?: number }).status)
        : 0;
    if (status === 403) {
      return res.status(403).json({
        error:
          "Gemini rejected this API key (403). Check GEMINI_API_KEY in .env and restart npm run dev.",
      });
    }
    const message = error instanceof Error ? error.message : "Transcription failed.";
    res.status(500).json({ error: message });
  }
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`FounderBrief server successfully initialized on http://0.0.0.0:${PORT}`);
  });
}

startServer();
