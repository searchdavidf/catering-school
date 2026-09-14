// src/supabase/config.ts

interface ProjectConfig {
  url: string
  anonKey: string
  serviceRoleKey?: string
}

const configs: Record<string, ProjectConfig> = {
  kanhas: {
    url: process.env.SUPABASE_KHANAS_URL || '',
    anonKey: process.env.SUPABASE_KHANAS_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_KHANAS_SERVICE_KEY,
  },
  fixbnb: {
    url: process.env.SUPABASE_FIXBNB_URL || '',
    anonKey: process.env.SUPABASE_FIXBNB_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_FIXBNB_SERVICE_KEY,
  },
  catering: {
    url: process.env.SUPABASE_CATERING_URL || 'https://ytaiekdifddyzobajrez.supabase.co',
    anonKey: process.env.SUPABASE_CATERING_ANON_KEY || 'sb_publishable_b1AAWzt-TygOku2zetokPA_oM2xXLTI',
    serviceRoleKey: process.env.SUPABASE_CATERING_SERVICE_KEY,
  },
}

export function getProjectConfig(project: string): ProjectConfig {
  const config = configs[project]
  if (!config?.url || !config?.anonKey) {
    throw new Error(`No Supabase config for project: ${project}`)
  }
  return config
}

export function addProjectConfig(project: string, config: ProjectConfig): void {
  configs[project] = config
}

export function listProjects(): string[] {
  return Object.keys(configs)
}
