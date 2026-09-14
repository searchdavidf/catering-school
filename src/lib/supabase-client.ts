// src/lib/supabase-client.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js'

const CATERING_URL = 'https://ytaiekdifddyzobajrez.supabase.co'
const CATERING_ANON_KEY = 'sb_publishable_b1AAWzt-TygOku2zetokPA_oM2xXLTI'

let client: SupabaseClient | null = null

export function getCateringClient(): SupabaseClient {
  if (!client) {
    client = createClient(CATERING_URL, CATERING_ANON_KEY)
  }
  return client
}
