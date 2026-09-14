// src/core/plugin-loader.ts

import { Skill } from './types'
import { getManifestForProject } from './registry'

// Static imports — no glob, no dynamic import, no __dirname
import weatherSkill from '../skills/global/weather'
import calculatorSkill from '../skills/global/calculator'
import webSearchSkill from '../skills/global/web-search'

import orderTakingSkill from '../skills/kanhas/order-taking'
import inventoryQuerySkill from '../skills/kanhas/inventory-query'
import salesQuerySkill from '../skills/kanhas/sales-query'

import turnoverStatusSkill from '../skills/fixbnb/turnover-status'
import cleanerAssignmentSkill from '../skills/fixbnb/cleaner-assignment'
import guestReadyCheckSkill from '../skills/fixbnb/guest-ready-check'

const skillCache = new Map<string, Skill[]>()

function buildCache() {
  const skills: Skill[] = [
    weatherSkill,
    calculatorSkill,
    webSearchSkill,
    orderTakingSkill,
    inventoryQuerySkill,
    salesQuerySkill,
    turnoverStatusSkill,
    cleanerAssignmentSkill,
    guestReadyCheckSkill,
  ]

  for (const skill of skills) {
    if (!skillCache.has(skill.project)) {
      skillCache.set(skill.project, [])
    }
    skillCache.get(skill.project)!.push(skill)
  }
}

// Build cache at module load time
buildCache()

export function getSkillsForProject(project: string): Skill[] {
  return skillCache.get(project) || []
}

export function getGlobalSkills(): Skill[] {
  return skillCache.get('global') || []
}

export function getAllSkills(): Skill[] {
  return Array.from(skillCache.values()).flat()
}

export function findSkill(project: string, name: string): Skill | undefined {
  const projectSkills = getSkillsForProject(project)
  const globalSkills = getGlobalSkills()
  return [...projectSkills, ...globalSkills].find(s => s.name === name)
}

export async function loadSkills(): Promise<void> {
  // No-op — cache is built at module load
  // Kept for API compatibility
}
