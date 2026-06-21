import type { User } from '@supabase/supabase-js';
import { supabase } from './supabase';

export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentUserId(): Promise<string> {
  const user = await getCurrentUser();
  if (!user) throw new Error('[DailyDabba] No active session — user must be signed in');
  return user.id;
}
