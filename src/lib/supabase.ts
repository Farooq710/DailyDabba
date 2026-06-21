import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (import.meta.env.DEV) {
  if (!url || url === 'https://your-project.supabase.co') {
    throw new Error(
      '[DailyDabba] VITE_SUPABASE_URL is missing. Copy .env.example → .env.local and fill in your Supabase URL.',
    );
  }
  if (!anonKey || anonKey === 'your-anon-key-here') {
    throw new Error(
      '[DailyDabba] VITE_SUPABASE_ANON_KEY is missing. Copy .env.example → .env.local and fill in your Supabase anon key.',
    );
  }
}

export const supabase = createClient<Database>(url!, anonKey!);
