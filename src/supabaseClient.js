import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseUrl = (rawUrl && rawUrl !== 'your_supabase_project_url') ? rawUrl : 'https://placeholder.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder';

export const supabase = createClient(supabaseUrl, supabaseKey);
