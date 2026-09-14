// src/app/catering/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const serviceKey = process.env.SUPABASE_CATERING_SERVICE_KEY
  
  if (!serviceKey) {
    return NextResponse.json(
      { error: 'Service key not configured. Set SUPABASE_CATERING_SERVICE_KEY env var.' },
      { status: 500 }
    )
  }

  const supabaseAdmin = createClient(
    'https://ytaiekdifddyzobajrez.supabase.co',
    serviceKey
  )

  try {
    const { email, password, full_name, role } = await req.json()

    if (!email || !password || !full_name || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!['staff', 'kitchen', 'manager', 'management'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: { full_name, role },
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authData.user.id,
        full_name,
        role,
      })

    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: profileError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, userId: authData.user.id })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
