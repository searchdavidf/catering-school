// js/config.js — Supabase configuration

const SUPABASE_URL = 'https://gzyvohwtlyqiojybichq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_tbb1PPPKud40Y9VDZpz4ig_GycAtQ6R';

window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
