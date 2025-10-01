import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface User {
  id: string;
  phone_number: string;
  household_id: string;
  name: string | null;
  password?: string;
  created_at?: string;
}

export interface Household {
  id: string;
  name: string;
  created_at?: string;
}
