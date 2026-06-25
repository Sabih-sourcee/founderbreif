import type { VercelRequest, VercelResponse } from "@vercel/node";

export function cors(res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Device-Id, X-User-Email");
}

export function handleOptions(req: VercelRequest, res: VercelResponse): boolean {
  cors(res);
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return true;
  }
  return false;
}

export function json(res: VercelResponse, status: number, body: unknown) {
  cors(res);
  res.status(status).json(body);
}
