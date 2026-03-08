/**
 * Persistent storage keys scoped by Telegram user ID.
 * Uses 'dev' when running outside Telegram.
 */

const PREFIX = 'polybot'

function getStorageKey(suffix: string): string {
  if (typeof window === 'undefined') return `${PREFIX}_${suffix}_dev`
  // Telegram Web App script sets window.Telegram
  const tg = (window as any).Telegram
  const userId = tg?.WebApp?.initDataUnsafe?.user?.id
  const scope = userId != null ? String(userId) : 'dev'
  return `${PREFIX}_${suffix}_${scope}`
}

export const STORAGE_KEYS = {
  balance: () => getStorageKey('balance'),
  history: () => getStorageKey('history'),
} as const

export function loadBalance(): number | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.balance())
    if (raw == null) return null
    const n = parseFloat(raw)
    return Number.isFinite(n) ? n : null
  } catch {
    return null
  }
}

export function saveBalance(value: number): void {
  try {
    localStorage.setItem(STORAGE_KEYS.balance(), String(value))
  } catch {}
}

export function loadHistory(): Array<{
  id: string
  type: 'yes' | 'no'
  amount: number
  mark: number
  closePrice: number
  won: boolean
  payout: number
  resolvedAt: number
}> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.history())
    if (raw == null) return null
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function saveHistory(history: Array<{
  id: string
  type: 'yes' | 'no'
  amount: number
  mark: number
  closePrice: number
  won: boolean
  payout: number
  resolvedAt: number
}>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.history(), JSON.stringify(history))
  } catch {}
}
