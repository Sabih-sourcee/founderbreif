/** App API env (Vercel + local). Landing site uses LANDING_* separately. */

export function appGeminiKey(): string | undefined {
  return process.env.APP_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
}

export function appAdminEmail(): string | undefined {
  return process.env.APP_ADMIN_EMAIL || process.env.ADMIN_EMAIL;
}

export function appAdminPassword(): string | undefined {
  return process.env.APP_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;
}

export function appJwtSecret(): string {
  return (
    process.env.APP_JWT_SECRET ||
    process.env.APP_ADMIN_PASSWORD ||
    "founderbrief-dev-secret"
  );
}

export function appUrl(): string {
  return process.env.APP_URL || "https://founderbreif.vercel.app";
}

export function appSupabaseUrl(): string | undefined {
  return process.env.APP_SUPABASE_URL || process.env.LANDING_SUPABASE_URL;
}

export function appSupabaseServiceKey(): string | undefined {
  return process.env.APP_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
}
