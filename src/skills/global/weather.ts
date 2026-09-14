// src/skills/global/weather.ts

import { Skill } from '../../core/types'

const weatherSkill: Skill = {
  project: 'global',
  name: 'weather',
  description: 'Get current weather and forecast for any location',
  capabilities: ['weather', 'forecast', 'temperature', 'conditions'],
  parameters: {
    type: 'object',
    properties: {
      location: { type: 'string', description: 'City name or location' },
      days: { type: 'number', description: 'Number of forecast days (default 1)' },
    },
    required: ['location'],
  },
  returns: {
    type: 'object',
    properties: {
      temperature: { type: 'number' },
      conditions: { type: 'string' },
      forecast: { type: 'array' },
    },
  },
  handler: async (params: any, ctx) => {
    const { location, days = 1 } = params
    // In production, call a weather API (OpenWeather, etc.)
    return {
      success: true,
      data: {
        location,
        temperature: 32,
        conditions: 'Sunny',
        note: 'Replace with real weather API call',
      },
      message: `Weather for ${location}: 32°C, Sunny`,
    }
  },
}

export default weatherSkill
