// Environment Export Utility
// FRONTDESK AGENTS Native System 100%

export interface EnvConfig {
  value: string
  description: string
  category: string
  secret?: boolean
}

// Generate .env.local content from configured environment variables
export function generateEnvFileContent(envVars: Record<string, EnvConfig>): string {
  const lines = [
    '# ==========================================',
    '# FRONTDESK AGENTS - Environment Variables',
    '# Generated from Environment Settings UI',
    '# ==========================================',
    ''
  ]

  Object.entries(envVars).forEach(([key, config]) => {
    const value = config.value || ''
    lines.push(`# ${config.description}`)
    if (config.secret && value) {
      lines.push(`${key}=${value}`)
    } else if (!config.secret) {
      lines.push(`${key}=${value || `YOUR_${key}_HERE`}`)
    } else {
      lines.push(`# ${key}=`)
    }
    lines.push('')
  })

  return lines.join('\n')
}

// Copy text to clipboard (browser compatible)
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return false
    }
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
    // Fallback for older browsers
    if (typeof document !== 'undefined') {
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand('copy')
        return true
      } catch {
        return false
      } finally {
        document.body.removeChild(textArea)
      }
    }
    return false
  } catch {
    return false
  }
}

// Format environment variable for display
export function formatEnvValue(key: string, value: string, isSecret: boolean): string {
  if (!value) return 'Not configured'
  if (isSecret) return '••••••••••••'
  return value
}