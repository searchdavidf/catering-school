// src/skills/kanhas/sales-query.ts

import { Skill } from '../../core/types'
import { getClient } from '../../supabase/client'

const salesQuerySkill: Skill = {
  project: 'kanhas',
  name: 'sales-query',
  description: 'Query sales data: daily totals, weekly summaries, top items, peak hours, and revenue trends.',
  capabilities: ['sales', 'revenue', 'analytics', 'report', 'daily', 'weekly', 'top-items'],
  parameters: {
    type: 'object',
    properties: {
      period: { type: 'string', enum: ['today', 'yesterday', 'this-week', 'last-week', 'this-month', 'custom'] },
      dateFrom: { type: 'string', description: 'Start date for custom range (YYYY-MM-DD)' },
      dateTo: { type: 'string', description: 'End date for custom range (YYYY-MM-DD)' },
    },
    required: ['period'],
  },
  returns: {
    type: 'object',
    properties: {
      totalRevenue: { type: 'number' },
      orderCount: { type: 'number' },
      topItems: { type: 'array' },
      averageOrder: { type: 'number' },
    },
  },
  handler: async (params: any, ctx) => {
    const { period } = params
    const db = getClient('kanhas')
    
    // Calculate date range
    const now = new Date()
    let dateFrom: Date
    const dateTo = new Date(now)
    
    switch (period) {
      case 'today':
        dateFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case 'yesterday':
        dateFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
        dateTo.setDate(dateTo.getDate() - 1)
        break
      case 'this-week':
        dateFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
        break
      case 'last-week':
        dateFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() - 7)
        dateTo.setDate(dateTo.getDate() - now.getDay() - 1)
        break
      case 'this-month':
        dateFrom = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      default:
        dateFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
    }
    
    // Get orders in range
    const { data: orders, error } = await db.from('orders')
      .select('id, total, created_at')
      .gte('created_at', dateFrom.toISOString())
      .lt('created_at', dateTo.toISOString())
    
    if (error) {
      return { success: false, data: null, message: `Sales query failed: ${error.message}` }
    }
    
    const totalRevenue = orders?.reduce((sum, o) => sum + parseFloat(o.total), 0) || 0
    const orderCount = orders?.length || 0
    const averageOrder = orderCount > 0 ? totalRevenue / orderCount : 0
    
    return {
      success: true,
      data: {
        totalRevenue: totalRevenue.toFixed(2),
        orderCount,
        averageOrder: averageOrder.toFixed(2),
        period,
      },
      message: `${period}: AED ${totalRevenue.toFixed(2)} from ${orderCount} orders. Average: AED ${averageOrder.toFixed(2)}`,
    }
  },
}

export default salesQuerySkill
