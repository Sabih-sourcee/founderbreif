import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleOptions, json } from "./_lib/cors";
import { generateBrief } from "./_lib/generateBrief";
import { tokenFromRequest } from "./_lib/auth";
import { resolveGenerationAccess, trackGeneration } from "./_lib/generationAccess";

export const config = { maxDuration: 60 };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  const { idea, answers, prefetch } = req.body ?? {};
  if (!idea) return json(res, 400, { error: "Product idea is required." });

  const authToken = tokenFromRequest(req);
  if (!prefetch) {
    const access = await resolveGenerationAccess(req, authToken);
    if (!access.canGenerate) {
      const limitLabel = access.isTester ? "tester" : "free";
      return json(res, 403, {
        error:
          access.isTester
            ? `Monthly tester limit reached (${access.limit} briefs). Resets next month.`
            : "Monthly free limit reached. Upgrade to Pro or wait until next month.",
        plan: access.plan,
        limit: access.limit,
        used: access.used,
        remaining: access.remaining,
      });
    }
  }

  try {
    const brief = await generateBrief(idea, answers ?? {});
    if (!prefetch) {
      await trackGeneration(req, authToken);
    }
    json(res, 200, brief);
  } catch (error) {
    console.error(error);
    json(res, 500, { error: "Brief generation failed." });
  }
}
