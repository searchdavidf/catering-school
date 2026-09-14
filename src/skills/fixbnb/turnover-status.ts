// src/skills/fixbnb/turnover-status.ts

import { Skill } from '../../core/types'
import { getClient } from '../../supabase/client'

const turnoverStatusSkill: Skill = {
  project: 'fixbnb',
  name: 'turnover-status',
  description: 'Check turnover and cleaning status for a property — current state, next check-in, cleaner assignment, and issues.',
  capabilities: ['turnover', 'status', 'cleaning', 'property', 'checkout', 'checkin', 'guest-ready'],
  parameters: {
    type: 'object',
    properties: {
      propertyId: { type: 'string', description: 'Property ID or code' },
      propertyName: { type: 'string', description: 'Property name (alternative to ID)' },
    },
    required: [],
  },
  returns: {
    type: 'object',
    properties: {
      property: { type: 'object' },
      turnover: { type: 'object' },
      cleaner: { type: 'object' },
      issues: { type: 'array' },
    },
  },
  handler: async (params: any, ctx) => {
    const { propertyId, propertyName } = params
    const db = getClient('fixbnb')
    
    // Find property
    let propertyQuery = db.from('properties').select('*')
    if (propertyId) {
      propertyQuery = propertyQuery.eq('code', propertyId)
    } else if (propertyName) {
      propertyQuery = propertyQuery.ilike('display_name', `%${propertyName}%`)
    } else {
      return { success: false, data: null, message: 'Provide propertyId or propertyName' }
    }
    
    const { data: property, error: propError } = await propertyQuery.single()
    if (propError || !property) {
      return { success: false, data: null, message: 'Property not found' }
    }
    
    // Get latest turnover
    const { data: turnover } = await db.from('turnovers')
      .select('*')
      .eq('property_id', property.id)
      .order('checkout_at', { ascending: false })
      .limit(1)
      .single()
    
    // Get assignment + cleaner
    let cleaner = null
    if (turnover) {
      const { data: assignment } = await db.from('assignments')
        .select('*, profiles!assignments_cleaner_id_fkey(full_name)')
        .eq('turnover_id', turnover.id)
        .single()
      
      if (assignment) {
        cleaner = {
          name: assignment.profiles?.full_name,
          status: assignment.acknowledged_at ? 'acknowledged' : 'pending',
          arrivedAt: assignment.arrived_at,
        }
      }
    }
    
    // Get open issues
    const { data: issues } = await db.from('issues')
      .select('*')
      .eq('turnover_id', turnover?.id || '')
      .eq('status', 'open')
    
    return {
      success: true,
      data: {
        property: { code: property.code, name: property.display_name, status: property.lifecycle_status },
        turnover: turnover ? { status: turnover.status, checkoutAt: turnover.checkout_at, nextCheckinAt: turnover.next_checkin_at } : null,
        cleaner,
        issues: issues || [],
      },
      message: `${property.display_name}: ${turnover?.status || 'no turnover'}. ${cleaner ? `Cleaner: ${cleaner.name} (${cleaner.status})` : 'No cleaner assigned'}. ${issues?.length || 0} open issues.`,
    }
  },
}

export default turnoverStatusSkill
