import { Website, Token, Wallet, WebsiteTheme, Transaction, ToolComponent } from './types'
import { classifyIntentToTools, getToolValue } from './toolClassifier'
import { WorldArchetype, WORLD_ARCHETYPES } from './worldTypes'

export function generateWebsiteId(): string {
  return `site-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function generateTokenId(): string {
  return `token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function generateWalletAddress(): string {
  return `0x${Math.random().toString(36).substr(2, 9)}${Math.random().toString(36).substr(2, 9)}`
}

export function generateTransactionId(): string {
  return `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function calculateWebsiteValue(website: Website): number {
  const worldDef = website.worldArchetype ? WORLD_ARCHETYPES[website.worldArchetype] : null
  const baseValue = worldDef?.baseValue || 1000
  
  const rarityBonus = baseValue * ((website.rarityMultiplier || 1.0) - 1.0)
  
  const toolDiversityScore = new Set((website.tools || []).map(t => t.type)).size
  const diversityMultiplier = 1 + (toolDiversityScore * 0.1)
  
  const pageValue = (website.pages?.length || 0) * 100
  const toolValue = (website.tools || []).reduce((sum, tool) => sum + getToolValue(tool.type), 0)
  
  const uniquenessBonus = (website.uniquenessScore || 1.0) * 100
  
  const activeBuildBonus = Math.min((website.activeBuildTime || 0) / (1000 * 60), 500)
  
  const totalValue = (baseValue + pageValue + toolValue + uniquenessBonus + rarityBonus + activeBuildBonus) * diversityMultiplier
  
  return Math.floor(totalValue)
}

export function formatValue(value: number | undefined): string {
  if (value === undefined || value === null || isNaN(value)) {
    return '0 ∞'
  }
  return `${value.toLocaleString()} ∞`
}

export function formatWalletAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  
  return date.toLocaleDateString()
}

export const THEME_OPTIONS: { value: WebsiteTheme; label: string; description: string }[] = [
  { 
    value: 'cosmic', 
    label: 'Cosmic', 
    description: 'Deep space theme with vibrant accents' 
  },
  { 
    value: 'minimal', 
    label: 'Minimal', 
    description: 'Clean and simple with focus on content' 
  },
  { 
    value: 'editorial', 
    label: 'Editorial', 
    description: 'Magazine-style with elegant typography' 
  },
  { 
    value: 'technical', 
    label: 'Technical', 
    description: 'Code-inspired with monospace fonts' 
  },
  { 
    value: 'vibrant', 
    label: 'Vibrant', 
    description: 'Bold colors and energetic design' 
  }
]

export function getThemeStyles(theme: WebsiteTheme): string {
  const themes = {
    cosmic: 'bg-gradient-to-br from-[oklch(0.12_0_0)] to-[oklch(0.18_0.02_260)] text-foreground',
    minimal: 'bg-white text-gray-900',
    editorial: 'bg-[oklch(0.98_0_0)] text-gray-900',
    technical: 'bg-[oklch(0.15_0_0)] text-green-400 font-mono',
    vibrant: 'bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 text-white'
  }
  return themes[theme] || themes.cosmic
}

export async function generateWebsiteContent(query: string, walletAddress: string): Promise<{
  title: string
  description: string
  content: string
  tools: ToolComponent[]
}> {
  const toolSpecs = await classifyIntentToTools(query)
  
  const tools: ToolComponent[] = toolSpecs.map((spec, index) => ({
    id: `tool-${Date.now()}-${index}`,
    type: spec.type,
    title: spec.title,
    description: spec.description,
    config: spec.config,
    addedAt: Date.now(),
    addedBy: walletAddress
  }))

  try {
    if (!window.spark || !window.spark.llm) {
      throw new Error('Spark API not available')
    }
    const prompt = `You are creating a comprehensive, educational website homepage based on this user query: ${query}

Generate a complete website with:
1. A clear, engaging title (5-10 words)
2. A concise description/tagline (15-25 words)
3. Rich, informative content organized into sections with headings

The content should be:
- Educational and research-backed
- Well-structured with clear sections
- Human-readable and engaging
- Practical and actionable
- NOT just a description, but actual valuable information

Return ONLY valid JSON in this exact format:
{
  "title": "Website Title Here",
  "description": "Brief compelling description here",
  "content": "## Section 1\\n\\nParagraph content...\\n\\n## Section 2\\n\\nMore content..."
}`
    const response = await window.spark.llm(prompt, 'gpt-4o', true)
    const parsed = JSON.parse(response)
    
    return {
      title: parsed.title || 'Untitled Website',
      description: parsed.description || 'A new Infinity website',
      content: parsed.content || '## Welcome\n\nContent is being generated...',
      tools
    }
  } catch (error) {
    console.error('Error generating content:', error)
    return {
      title: query,
      description: 'An Infinity-powered website',
      content: `## ${query}\n\nThis website was created to explore: ${query}\n\nContent generation is in progress...`,
      tools
    }
  }
}

export async function generateWorldContent(
  archetype: WorldArchetype,
  walletAddress: string,
  slotCombination?: string
): Promise<{
  title: string
  description: string
  content: string
  tools: ToolComponent[]
}> {
  const worldDef = WORLD_ARCHETYPES[archetype]
  
  const tools: ToolComponent[] = worldDef.tools.map((toolType, index) => ({
    id: `tool-${Date.now()}-${index}`,
    type: 'content-hub',
    title: toolType.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    description: `${toolType} for ${worldDef.name}`,
    config: { worldType: archetype, toolName: toolType },
    addedAt: Date.now(),
    addedBy: walletAddress
  }))

  try {
    if (!window.spark || !window.spark.llm) {
      throw new Error('Spark API not available')
    }
    const slotInfo = slotCombination ? `- Slot Combination: ${slotCombination}` : ''
    const prompt = `You are creating an educational game-world website based on the "${worldDef.name}" archetype.

World Details:
- Name: ${worldDef.name}
- Emoji: ${worldDef.emoji}
- Description: ${worldDef.description}
- Educational Goal: ${worldDef.educationalGoal}
${slotInfo}

Generate engaging content that:
1. Explains what this world teaches through play
2. Describes the game mechanics and interactions
3. Highlights how learning happens through discovery
4. Provides clear next steps for the user

Return ONLY valid JSON in this exact format:
{
  "title": "Engaging World Title (5-8 words)",
  "description": "Compelling tagline about learning through play (15-25 words)",
  "content": "## Welcome to [World]\\n\\nIntroduction...\\n\\n## How It Works\\n\\nMechanics...\\n\\n## What You'll Learn\\n\\nEducational outcomes...\\n\\n## Get Started\\n\\nNext steps..."
}`
    const response = await window.spark.llm(prompt, 'gpt-4o', true)
    const parsed = JSON.parse(response)
    
    return {
      title: parsed.title || worldDef.name,
      description: parsed.description || worldDef.description,
      content: parsed.content || `## ${worldDef.name}\n\n${worldDef.description}\n\n### Educational Goal\n\n${worldDef.educationalGoal}`,
      tools
    }
  } catch (error) {
    console.error('Error generating world content:', error)
    return {
      title: worldDef.name,
      description: worldDef.description,
      content: `## ${worldDef.name}\n\n${worldDef.description}\n\n### Educational Goal\n\n${worldDef.educationalGoal}\n\n### Get Started\n\nExplore the tools below to begin your learning journey.`,
      tools
    }
  }
}

export async function generatePageContent(websiteContext: string, pageQuery: string, walletAddress: string): Promise<{
  title: string
  content: string
  tools: ToolComponent[]
}> {
  const toolSpecs = await classifyIntentToTools(pageQuery)
  
  const tools: ToolComponent[] = toolSpecs.map((spec, index) => ({
    id: `tool-${Date.now()}-${index}`,
    type: spec.type,
    title: spec.title,
    description: spec.description,
    config: spec.config,
    addedAt: Date.now(),
    addedBy: walletAddress
  }))

  try {
    if (!window.spark || !window.spark.llm) {
      throw new Error('Spark API not available')
    }
    const prompt = `You are adding a new page to a website about ${websiteContext}.

The user wants to add a page about: ${pageQuery}

Generate a new page with:
1. A clear page title (3-8 words)
2. Rich, informative content organized with markdown headings and paragraphs

Return ONLY valid JSON in this exact format:
{
  "title": "Page Title Here",
  "content": "## Section\\n\\nContent here..."
}`
    const response = await window.spark.llm(prompt, 'gpt-4o', true)
    const parsed = JSON.parse(response)
    
    return {
      title: parsed.title || pageQuery,
      content: parsed.content || `## ${pageQuery}\n\nContent coming soon...`,
      tools
    }
  } catch (error) {
    console.error('Error generating page:', error)
    return {
      title: pageQuery,
      content: `## ${pageQuery}\n\nThis page explores ${pageQuery} in detail.`,
      tools
    }
  }
}
