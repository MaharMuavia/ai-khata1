import { createClient } from "@supabase/supabase-js";

let supabaseServerInstance: ReturnType<typeof createClient> | null = null;

function getSupabaseServer() {
  if (supabaseServerInstance) {
    return supabaseServerInstance;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL. Check your .env.local file."
    );
  }

  if (!supabaseServiceKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY. Check your .env.local file. Get it from Supabase Dashboard > Settings > API > service_role"
    );
  }

  supabaseServerInstance = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return supabaseServerInstance;
}

// Export a lazy-loaded instance
export const supabaseServer = new Proxy(
  {},
  {
    get: (target, prop) => {
      const instance = getSupabaseServer();
      return (instance as any)[prop];
    },
  }
) as ReturnType<typeof createClient>;
