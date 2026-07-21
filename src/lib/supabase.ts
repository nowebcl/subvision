import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[SUBVISION] Faltan variables de entorno VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Usando modo local.');
}

// Use a placeholder URL when env vars are missing so createClient doesn't throw.
// All Supabase calls will fail gracefully and the app falls back to localStorage/mock data.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);
