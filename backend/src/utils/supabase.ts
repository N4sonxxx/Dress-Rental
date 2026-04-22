import { createClient } from "@supabase/supabase-js";

// Provide fallback dummy values so the server can boot and handle HTTP requests,
// even if Vercel doesn't have the environment variables explicitly loaded yet.
const supabaseUrl = process.env.SUPABASE_URL || "https://missing-supabase-url.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "missing-key";

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn("Supabase credentials missing! Cloud storage uploads will fail.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
