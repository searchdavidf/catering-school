// src/core/intent-router.ts

import { GoogleGenerativeAI } from '@google/generative-ai'
import { Skill, RequestContext, SkillResult } from './types'
import { getSkillsForProject, getGlobalSkills, findSkill } from './plugin-loader'
import { getManifestForProject } from './registry'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function routeIntent(
  userInput: string,
  context: RequestContext
): Promise<SkillResult> {
  const projectSkills = getSkillsForProject(context.project)
  const globalSkills = getGlobalSkills()
  const available = [...globalSkills, ...projectSkills]
  
  if (available.length === 0) {
    return { success: false, data: null, message: 'No skills available for this project' }
  }
  
  // Use manifest descriptions for routing (cheaper than reading full skill files)
  const manifestEntries = getManifestForProject(context.project)
  const globalManifest = getManifestForProject('global')
  const allManifest = [...globalManifest, ...manifestEntries]
  
  const skillList = allManifest.map(s => 
    `- ${s.name} (${s.project}): ${s.description} [capabilities: ${s.capabilities.join(', ')}]`
  ).join('\n')
  
  const prompt = `You are an intent routing AI. Given a user's input, determine which skill should handle it.

Available skills:
${skillList}

User input: "${userInput}"
Project: ${context.project}
Role: ${context.role}

Respond with ONLY the skill name (e.g., "order-taking") or "none" if no skill matches. Nothing else.`
  
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
  const result = await model.generateContent(prompt)
  const response = result.response.text().trim().toLowerCase()
  
  // Find the matched skill
  const matchedSkill = findSkill(context.project, response) || findSkill('global', response)
  
  if (!matchedSkill) {
    return { success: false, data: null, message: `No skill matched for: "${response}"` }
  }
  
  // Execute the skill
  try {
    const skillResult = await matchedSkill.handler({}, context)
    return skillResult
  } catch (error) {
    return { success: false, data: null, message: `Skill error: ${error}` }
  }
}

export async function executeSkill(
  skillName: string,
  params: unknown,
  context: RequestContext
): Promise<SkillResult> {
  const skill = findSkill(context.project, skillName) || findSkill('global', skillName)
  
  if (!skill) {
    return { success: false, data: null, message: `Skill not found: ${skillName}` }
  }
  
  try {
    return await skill.handler(params, context)
  } catch (error) {
    return { success: false, data: null, message: `Skill error: ${error}` }
  }
}
