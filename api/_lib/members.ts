import { appAdminEmail } from "./env";

export type MemberPlan = "free" | "tester" | "pro" | "admin";

export const TESTER_MONTHLY_LIMIT = 10;
export const FREE_MONTHLY_LIMIT = 1;

export interface MemberStatus {
  plan: MemberPlan;
  isAdmin: boolean;
  isTester: boolean;
  limit: number | null;
  used: number;
  remaining: number | null;
  canGenerate: boolean;
}

function supabaseConfig(): { url: string; serviceKey: string } | null {
  const url = process.env.APP_SUPABASE_URL || process.env.LANDING_SUPABASE_URL;
  const serviceKey =
    process.env.APP_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return { url: url.replace(/\/$/, ""), serviceKey };
}

export function currentMonthKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function normalizeEmail(email: string | undefined | null): string | null {
  if (!email) return null;
  const trimmed = email.trim().toLowerCase();
  return trimmed.includes("@") ? trimmed : null;
}

async function supabaseRest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T | null> {
  const cfg = supabaseConfig();
  if (!cfg) return null;

  const res = await fetch(`${cfg.url}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: cfg.serviceKey,
      Authorization: `Bearer ${cfg.serviceKey}`,
      "Content-Type": "application/json",
      Prefer: options.method === "POST" ? "return=representation,resolution=merge-duplicates" : "return=representation",
      ...(options.headers ?? {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Supabase REST error:", res.status, text);
    return null;
  }

  if (res.status === 204) return null;
  return (await res.json()) as T;
}

export async function getMemberStatus(emailRaw: string | undefined | null): Promise<MemberStatus | null> {
  const email = normalizeEmail(emailRaw);
  if (!email) return null;

  const adminEmail = appAdminEmail()?.trim().toLowerCase();
  if (adminEmail && email === adminEmail) {
    return {
      plan: "admin",
      isAdmin: true,
      isTester: false,
      limit: null,
      used: 0,
      remaining: null,
      canGenerate: true,
    };
  }

  const cfg = supabaseConfig();
  if (!cfg) return null;

  const monthKey = currentMonthKey();

  const entitlements = await supabaseRest<
    Array<{ plan: MemberPlan; monthly_limit: number | null }>
  >(
    `app_member_entitlements?email=eq.${encodeURIComponent(email)}&select=plan,monthly_limit&limit=1`
  );

  const entitlement = entitlements?.[0];
  if (!entitlement) return null;

  const plan = entitlement.plan;
  if (plan === "admin" || plan === "pro") {
    return {
      plan,
      isAdmin: plan === "admin",
      isTester: false,
      limit: null,
      used: 0,
      remaining: null,
      canGenerate: true,
    };
  }

  const limit =
    entitlement.monthly_limit ??
    (plan === "tester" ? TESTER_MONTHLY_LIMIT : FREE_MONTHLY_LIMIT);

  const usageRows = await supabaseRest<Array<{ used_count: number }>>(
    `generation_usage?email=eq.${encodeURIComponent(email)}&month_key=eq.${encodeURIComponent(monthKey)}&select=used_count&limit=1`
  );
  const used = usageRows?.[0]?.used_count ?? 0;
  const remaining = Math.max(0, limit - used);

  return {
    plan,
    isAdmin: false,
    isTester: plan === "tester",
    limit,
    used,
    remaining,
    canGenerate: remaining > 0,
  };
}

export async function recordMemberGeneration(emailRaw: string | undefined | null): Promise<void> {
  const email = normalizeEmail(emailRaw);
  if (!email) return;

  const status = await getMemberStatus(email);
  if (!status || status.limit === null) return;

  const monthKey = currentMonthKey();
  const nextUsed = status.used + 1;

  const existing = await supabaseRest<Array<{ used_count: number }>>(
    `generation_usage?email=eq.${encodeURIComponent(email)}&month_key=eq.${encodeURIComponent(monthKey)}&select=used_count&limit=1`
  );

  if (existing?.length) {
    await supabaseRest(`generation_usage?email=eq.${encodeURIComponent(email)}&month_key=eq.${encodeURIComponent(monthKey)}`, {
      method: "PATCH",
      body: JSON.stringify({ used_count: nextUsed }),
      headers: { Prefer: "return=minimal" },
    });
  } else {
    await supabaseRest("generation_usage", {
      method: "POST",
      body: JSON.stringify({
        email,
        month_key: monthKey,
        used_count: 1,
      }),
      headers: { Prefer: "return=minimal" },
    });
  }

  await supabaseRest(`profiles?email=eq.${encodeURIComponent(email)}`, {
    method: "PATCH",
    body: JSON.stringify({ plan: status.plan, role: status.isTester ? "tester" : "user" }),
    headers: { Prefer: "return=minimal" },
  }).catch(() => undefined);
}
