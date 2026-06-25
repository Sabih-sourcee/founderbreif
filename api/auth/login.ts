import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleOptions, json } from "../_lib/cors";
import { createAdminToken, loginAdmin } from "../_lib/auth";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  const { email, password } = req.body ?? {};
  if (!email || !password) return json(res, 400, { error: "Email and password are required." });

  const session = loginAdmin(String(email), String(password));
  if (!session) return json(res, 401, { error: "Invalid email or password." });

  const token = createAdminToken(session.email);
  json(res, 200, {
    token,
    email: session.email,
    isAdmin: true,
    name: session.name,
  });
}
