// src/skills/fixbnb/cleaner-assignment.ts

import { Skill } from '../../core/types'
import { getClient } from '../../supabase/client'

const cleanerAssignmentSkill: Skill = {
  project: 'fixbnb',
  name: 'cleaner-assignment',
  description: 'Assign or reassign a cleaner to a turnover. Handles schedule changes and notifications.',
  capabilities: ['cleaner', 'assign', 'turnover', 'schedule', 'reassign', 'notify'],
  parameters: {
    type: 'object',
    properties: {
      turnoverId: { type: 'string', description: 'Turnover ID' },
      cleanerId: { type: 'string', description: 'Cleaner profile ID' },
      cleanerName: { type: 'string', description: 'Cleaner name (alternative to ID)' },
      checkoutAt: { type: 'string', description: 'Updated checkout time (optional)' },
      checkinAt: { type: 'string', description: 'Updated check-in time (optional)' },
    },
    required: ['turnoverId'],
  },
  returns: {
    type: 'object',
    properties: {
      assignmentId: { type: 'string' },
      status: { type: 'string' },
      cleaner: { type: 'object' },
    },
  },
  handler: async (params: any, ctx) => {
    const { turnoverId, cleanerId, cleanerName, checkoutAt, checkinAt } = params
    const db = getClient('fixbnb')
    
    // Resolve cleaner
    let resolvedCleanerId = cleanerId
    if (!resolvedCleanerId && cleanerName) {
      const { data: cleaner } = await db.from('profiles')
        .select('id')
        .eq('role', 'cleaner')
        .ilike('full_name', `%${cleanerName}%`)
        .single()
      resolvedCleanerId = cleaner?.id
    }
    
    if (!resolvedCleanerId) {
      return { success: false, data: null, message: 'Cleaner not found. Provide cleanerId or cleanerName.' }
    }
    
    // Update turnover schedule if provided
    if (checkoutAt || checkinAt) {
      const updates: any = {}
      if (checkoutAt) updates.checkout_at = checkoutAt
      if (checkinAt) updates.next_checkin_at = checkinAt
      await db.from('turnovers').update(updates).eq('id', turnoverId)
    }
    
    // Create/update assignment
    const { data: existing } = await db.from('assignments')
      .select('id')
      .eq('turnover_id', turnoverId)
      .single()
    
    const assignmentData = {
      turnover_id: turnoverId,
      cleaner_id: resolvedCleanerId,
    }
    
    let result
    if (existing) {
      result = await db.from('assignments').update(assignmentData).eq('id', existing.id).select().single()
    } else {
      result = await db.from('assignments').insert(assignmentData).select().single()
    }
    
    // Get cleaner name for response
    const { data: cleanerProfile } = await db.from('profiles')
      .select('full_name')
      .eq('id', resolvedCleanerId)
      .single()
    
    return {
      success: true,
      data: {
        assignmentId: result.data?.id,
        status: 'assigned',
        cleaner: { id: resolvedCleanerId, name: cleanerProfile?.full_name },
        turnoverId,
      },
      message: `${cleanerProfile?.full_name} ${existing ? 'reassigned' : 'assigned'} to turnover ${turnoverId}. ${checkoutAt || checkinAt ? 'Schedule updated.' : ''}`,
    }
  },
}

export default cleanerAssignmentSkill
