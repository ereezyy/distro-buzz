// @supabase/supabase-js is loaded via CDN UMD script in index.html
// The UMD build exposes window.supabase with a createClient export
declare const window: Window & {
  supabase: { createClient: typeof import("@supabase/supabase-js").createClient };
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
