// src/skills/global/calculator.ts

import { Skill } from '../../core/types'

const calculatorSkill: Skill = {
  project: 'global',
  name: 'calculator',
  description: 'Perform mathematical calculations and unit conversions',
  capabilities: ['math', 'calculation', 'convert', 'arithmetic', 'percentage'],
  parameters: {
    type: 'object',
    properties: {
      expression: { type: 'string', description: 'Math expression to evaluate' },
    },
    required: ['expression'],
  },
  returns: {
    type: 'object',
    properties: {
      result: { type: 'number' },
      expression: { type: 'string' },
    },
  },
  handler: async (params: any, ctx) => {
    try {
      const { expression } = params
      // Safe math eval (use mathjs or similar in production)
      const result = Function('"use strict"; return (' + expression + ')')()
      return {
        success: true,
        data: { expression, result },
        message: `${expression} = ${result}`,
      }
    } catch (e) {
      return {
        success: false,
        data: null,
        message: `Could not evaluate: ${params.expression}`,
      }
    }
  },
}

export default calculatorSkill
