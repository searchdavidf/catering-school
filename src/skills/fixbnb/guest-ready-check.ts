// src/skills/fixbnb/guest-ready-check.ts

import { Skill } from '../../core/types'
import { getClient } from '../../supabase/client'

const guestReadyCheckSkill: Skill = {
  project: 'fixbnb',
  name: 'guest-ready-check',
  description: 'Verify a property is guest-ready: QC status, checklist completion, evidence photos, and issue resolution.',
  capabilities: ['guest-ready', 'qc', 'checklist', 'verification', 'inspection', 'evidence'],
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
      ready: { type: 'boolean' },
      checklist: { type: 'array' },
      evidence: { type: 'array' },
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
    
    const { data: property } = await propertyQuery.single()
    if (!property) {
      return { success: false, data: null, message: 'Property not found' }
    }
    
    // Get latest turnover
    const { data: turnover } = await db.from('turnovers')
      .select('*')
      .eq('property_id', property.id)
      .order('checkout_at', { ascending: false })
      .limit(1)
      .single()
    
    // Get checklist
    const { data: checklist } = await db.from('checklist_results')
      .select('*')
      .eq('turnover_id', turnover?.id || '')
    
    // Get evidence
    const { data: evidence } = await db.from('evidence')
      .select('*')
      .eq('turnover_id', turnover?.id || '')
    
    // Get open issues
    const { data: issues } = await db.from('issues')
      .select('*')
      .eq('turnover_id', turnover?.id || '')
      .eq('status', 'open')
    
    const allPassed = checklist?.every(c => c.result === 'pass' || c.result === 'na')
    const ready = allPassed && (!issues || issues.length === 0) && turnover?.status === 'guest_ready'
    
    return {
      success: true,
      data: {
        ready,
        property: property.display_name,
        turnoverStatus: turnover?.status,
        checklist: checklist || [],
        evidenceCount: evidence?.length || 0,
        openIssues: issues?.length || 0,
      },
      message: ready
        ? `${property.display_name}: Guest-ready ✓ All zones passed. ${evidence?.length || 0} evidence photos.`
        : `${property.display_name}: NOT ready. ${issues?.length || 0} open issues. ${checklist?.filter(c => c.result === 'pending').length || 0} checklist items pending.`,
    }
  },
}

export default guestReadyCheckSkill
