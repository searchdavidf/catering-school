// src/core/types.ts

export interface Skill {
  project: string
  name: string
  description: string
  capabilities: string[]
  parameters: Record<string, unknown>
  returns: Record<string, unknown>
  handler: (params: unknown, ctx: RequestContext) => Promise<SkillResult>
}

export interface SkillResult {
  success: boolean
  data: unknown
  message: string
}

export interface RequestContext {
  project: string
  userId: string
  role: 'owner' | 'staff' | 'customer'
  sessionId: string
  db: SupabaseClient
}

export interface SupabaseClient {
  from: (table: string) => {
    select: (columns: string) => Promise<{ data: unknown; error: unknown }>
    insert: (data: unknown) => Promise<{ data: unknown; error: unknown }>
    update: (data: unknown) => Promise<{ data: unknown; error: unknown }>
    eq: (column: string, value: unknown) => {
      single: () => Promise<{ data: unknown; error: unknown }>
    }
  }
}

export interface SkillManifestEntry {
  project: string
  name: string
  description: string
  capabilities: string[]
  file: string
}
