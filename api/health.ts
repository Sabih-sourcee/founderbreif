import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleOptions, json } from "./_lib/cors";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;
  if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });
  json(res, 200, { status: "ok", service: "founderbrief-app-api" });
}
