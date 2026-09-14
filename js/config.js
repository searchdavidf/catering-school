// js/config.js — Supabase configuration

const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';

window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
