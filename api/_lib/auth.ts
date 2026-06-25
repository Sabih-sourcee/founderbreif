import crypto from "crypto";
import { appAdminEmail, appAdminPassword, appJwtSecret } from "./env";

export interface AdminSession {
  email: string;
  isAdmin: true;
  name: string;
}

export function createAdminToken(email: string): string {
  const payload = JSON.stringify({
    email,
    isAdmin: true,
    exp: Date.now() + 30 * 24 * 60 * 60 * 1000,
  });
  const sig = crypto.createHmac("sha256", appJwtSecret()).update(payload).digest("hex");
  return Buffer.from(`${payload}.${sig}`).toString("base64url");
}

export function verifyAdminToken(token: string | null | undefined): AdminSession | null {
  if (!token) return null;
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const dot = decoded.lastIndexOf(".");
    if (dot < 0) return null;
    const payload = decoded.slice(0, dot);
    const sig = decoded.slice(dot + 1);
    const expected = crypto.createHmac("sha256", appJwtSecret()).update(payload).digest("hex");
    if (sig !== expected) return null;
    const data = JSON.parse(payload) as { email?: string; isAdmin?: boolean; exp?: number };
    if (!data.isAdmin || !data.email || (data.exp && Date.now() > data.exp)) return null;
    return { email: data.email, isAdmin: true, name: "Founder Admin" };
  } catch {
    return null;
  }
}

export function loginAdmin(email: string, password: string): AdminSession | null {
  const adminEmail = appAdminEmail()?.trim().toLowerCase();
  const adminPassword = appAdminPassword();
  if (!adminEmail || !adminPassword) return null;
  if (email.trim().toLowerCase() !== adminEmail || password !== adminPassword) return null;
  return { email: adminEmail, isAdmin: true, name: "Founder Admin" };
}

export function tokenFromRequest(req: { headers: Record<string, string | string[] | undefined> }) {
  const header = req.headers.authorization;
  const raw = Array.isArray(header) ? header[0] : header;
  return raw?.startsWith("Bearer ") ? raw.slice(7) : null;
}
