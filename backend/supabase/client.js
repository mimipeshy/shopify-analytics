// backend/supabase/client.js
import { createClient } from "@supabase/supabase-js";

/**
 * Returns a singleton Supabase client.
 * Lazy-loaded to avoid ESM timing issues.
 */
let supabase;

export const getSupabaseClient = () => {
  if (!supabase) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error("🔹 SUPABASE_URL:", supabaseUrl);
      console.error("🔹 SUPABASE_SERVICE_ROLE_KEY:", supabaseKey);
      throw new Error(
        `❌ Supabase environment variables are missing. URL: ${supabaseUrl}, Key: ${
          supabaseKey ? supabaseKey.substring(0, 5) + "..." : "undefined"
        }`
      );
    }

    supabase = createClient(supabaseUrl, supabaseKey);
    console.log("✅ Supabase client initialized");
  }
  return supabase;
};
