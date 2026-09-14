// src/skills/kanhas/inventory-query.ts

import { Skill } from '../../core/types'
import { getClient } from '../../supabase/client'

const inventoryQuerySkill: Skill = {
  project: 'kanhas',
  name: 'inventory-query',
  description: 'Check stock levels, supplier info, reorder status, and low-stock alerts for ingredients and supplies.',
  capabilities: ['inventory', 'stock', 'supplier', 'reorder', 'ingredients', 'low-stock'],
  parameters: {
    type: 'object',
    properties: {
      item: { type: 'string', description: 'Item name to check (optional — omit for all low-stock)' },
      category: { type: 'string', enum: ['vegetables', 'dairy', 'grains', 'spices', 'supplies', 'all'] },
    },
    required: [],
  },
  returns: {
    type: 'object',
    properties: {
      items: { type: 'array' },
      lowStock: { type: 'array' },
    },
  },
  handler: async (params: any, ctx) => {
    const { item, category = 'all' } = params
    const db = getClient('kanhas')
    
    let query = db.from('inventory').select('*')
    
    if (item) {
      query = query.ilike('name', `%${item}%`)
    }
    if (category !== 'all') {
      query = query.eq('category', category)
    }
    
    const { data: items, error } = await query
    
    if (error) {
      return { success: false, data: null, message: `Inventory query failed: ${error.message}` }
    }
    
    const lowStock = (items || []).filter(i => i.stock <= i.reorder_level)
    
    return {
      success: true,
      data: { items: items || [], lowStock },
      message: lowStock.length > 0
        ? `${lowStock.length} items need reordering: ${lowStock.map(i => `${i.name} (${i.stock} ${i.unit})`).join(', ')}`
        : 'All stock levels healthy',
    }
  },
}

export default inventoryQuerySkill
