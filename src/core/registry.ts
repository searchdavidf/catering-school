// src/core/registry.ts

import { SkillManifestEntry } from './types'

// Static manifest — generated at build time, no filesystem scanning at runtime
const manifest: SkillManifestEntry[] = [
  // Global
  { project: 'global', name: 'weather', description: 'Get current weather and forecast', capabilities: ['weather', 'forecast'], file: 'global/weather.ts' },
  { project: 'global', name: 'calculator', description: 'Math calculations', capabilities: ['math', 'calculation'], file: 'global/calculator.ts' },
  { project: 'global', name: 'web-search', description: 'Search the web', capabilities: ['search', 'web'], file: 'global/web-search.ts' },
  // Kanhas
  { project: 'kanhas', name: 'order-taking', description: 'Create customer orders', capabilities: ['order', 'menu', 'cart'], file: 'kanhas/order-taking.ts' },
  { project: 'kanhas', name: 'inventory-query', description: 'Check stock levels', capabilities: ['inventory', 'stock'], file: 'kanhas/inventory-query.ts' },
  { project: 'kanhas', name: 'sales-query', description: 'Query sales data', capabilities: ['sales', 'revenue'], file: 'kanhas/sales-query.ts' },
  // Fix BnB
  { project: 'fixbnb', name: 'turnover-status', description: 'Check turnover status', capabilities: ['turnover', 'status'], file: 'fixbnb/turnover-status.ts' },
  { project: 'fixbnb', name: 'cleaner-assignment', description: 'Assign cleaners', capabilities: ['cleaner', 'assign'], file: 'fixbnb/cleaner-assignment.ts' },
  { project: 'fixbnb', name: 'guest-ready-check', description: 'Verify guest-ready', capabilities: ['guest-ready', 'qc'], file: 'fixbnb/guest-ready-check.ts' },
]

export function getManifest(): SkillManifestEntry[] {
  return manifest
}

export function getManifestForProject(project: string): SkillManifestEntry[] {
  return manifest.filter(e => e.project === project)
}

export function findInManifest(project: string, name: string): SkillManifestEntry | undefined {
  return manifest.find(e => e.project === project && e.name === name)
}
