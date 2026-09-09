import { createClient } from '@supabase/supabase-js';

const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

const storedUrl = localStorage.getItem('wc2_supabase_url') || '';
const storedKey = localStorage.getItem('wc2_supabase_key') || '';

// New project credentials can be provided via .env (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)
// or entered dynamically in Settings. Old project fallback credentials have been safely detached.
const supabaseUrl = storedUrl || envUrl;
const supabaseKey = storedKey || envKey;

// Initialize client only if valid new keys are present
export const supabase = (() => {
  try {
    return supabaseUrl && supabaseKey 
      ? createClient(supabaseUrl, supabaseKey)
      : null;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
})();


