import type { VercelRequest } from "@vercel/node";
import { FREE_MONTHLY_LIMIT, getMemberStatus, recordMemberGeneration } from "./members";
import { verifyAdminToken } from "./auth";

export function userEmailFromRequest(req: VercelRequest): string | null {
  const raw = req.headers["x-user-email"];
  const header = Array.isArray(raw) ? raw[0] : raw;
  if (!header || !header.includes("@")) return null;
  return header.trim().toLowerCase();
}

export async function resolveGenerationAccess(req: VercelRequest, authToken: string | null) {
  const admin = verifyAdminToken(authToken);
  if (admin) {
    return {
      isAdmin: true,
      isTester: false,
      plan: "admin" as const,
      used: 0,
      limit: null as number | null,
      remaining: null as number | null,
      canGenerate: true,
      email: admin.email,
    };
  }

  const email = userEmailFromRequest(req);
  if (email) {
    const member = await getMemberStatus(email);
    if (member) {
      return {
        isAdmin: member.isAdmin,
        isTester: member.isTester,
        plan: member.plan,
        used: member.used,
        limit: member.limit,
        remaining: member.remaining,
        canGenerate: member.canGenerate,
        email,
      };
    }
  }

  return {
    isAdmin: false,
    isTester: false,
    plan: "free" as const,
    used: 0,
    limit: FREE_MONTHLY_LIMIT,
    remaining: FREE_MONTHLY_LIMIT,
    canGenerate: true,
    email,
  };
}

export async function trackGeneration(req: VercelRequest, authToken: string | null) {
  const access = await resolveGenerationAccess(req, authToken);
  if (!access.isAdmin && access.email && access.limit !== null) {
    await recordMemberGeneration(access.email);
  }
}
