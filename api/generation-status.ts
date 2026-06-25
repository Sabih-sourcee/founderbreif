import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleOptions, json } from "./_lib/cors";
import { tokenFromRequest } from "./_lib/auth";
import { resolveGenerationAccess } from "./_lib/generationAccess";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;
  if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });

  const access = await resolveGenerationAccess(req, tokenFromRequest(req));

  json(res, 200, {
    isAdmin: access.isAdmin,
    isTester: access.isTester,
    plan: access.plan,
    used: access.used,
    limit: access.limit,
    remaining: access.remaining,
    canGenerate: access.canGenerate,
  });
}
