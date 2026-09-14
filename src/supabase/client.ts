// src/supabase/client.ts

import { createClient } from '@supabase/supabase-js'
import { getProjectConfig } from './config'

export function getClient(project: string) {
  const config = getProjectConfig(project)
  return createClient(config.url, config.anonKey)
}
