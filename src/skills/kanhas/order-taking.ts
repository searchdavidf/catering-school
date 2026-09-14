// src/skills/kanhas/order-taking.ts

import { Skill } from '../../core/types'

const orderTakingSkill: Skill = {
  project: 'kanhas',
  name: 'order-taking',
  description: 'Create a new customer order from voice or text input. Handles menu items, quantities, special instructions, and cart management.',
  capabilities: ['order', 'menu', 'cart', 'checkout', 'food', 'restaurant'],
  parameters: {
    type: 'object',
    properties: {
      items: { type: 'array', description: 'Array of {name, quantity, notes}' },
      customer: { type: 'string', description: 'Customer name or table number' },
      channel: { type: 'string', enum: ['dine-in', 'takeaway', 'delivery', 'whatsapp'] },
    },
    required: ['items'],
  },
  returns: {
    type: 'object',
    properties: {
      orderId: { type: 'string' },
      total: { type: 'number' },
      items: { type: 'array' },
      estimatedTime: { type: 'number' },
    },
  },
  handler: async (params: any, ctx) => {
    const { items, customer = 'walk-in', channel = 'dine-in' } = params
    
    // Calculate total
    let total = 0
    for (const item of items) {
      total += (item.price || 0) * (item.quantity || 1)
    }
    
    const orderId = `ORD-${Date.now()}`
    const estimatedTime = Math.max(15, items.length * 5)
    
    // In production: insert into Supabase orders table
    // await ctx.db.from('orders').insert({...})
    
    return {
      success: true,
      data: { orderId, total, items, customer, channel, estimatedTime, status: 'confirmed' },
      message: `Order ${orderId.slice(0, 8)} confirmed for ${customer}. Total: AED ${total.toFixed(2)}. ETA: ${estimatedTime} minutes.`,
    }
  },
}

export default orderTakingSkill
