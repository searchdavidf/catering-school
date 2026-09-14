// src/app/api/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { routeIntent } from '@/core/intent-router'
import { loadSkills } from '@/core/plugin-loader'
import { getClient } from '@/supabase/client'

let initialized = false

async function ensureInitialized() {
  if (!initialized) {
    await loadSkills()
    initialized = true
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureInitialized()
    
    const body = await req.json()
    const { text, project, userId, role } = body

    // Create real Supabase client for this project
    const db = getClient(project || 'kanhas')

    const result = await routeIntent(text, {
      project: project || 'kanhas',
      userId: userId || 'anonymous',
      role: role || 'customer',
      sessionId: `sess-${Date.now()}`,
      db: db as any,
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json(
      { success: false, message: `Server error: ${error.message || error}` },
      { status: 500 }
    )
  }
}
