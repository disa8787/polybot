/**
 * Persistent storage keys scoped by Telegram user ID.
 * userId must be passed explicitly; use getUserIdForStorage() from telegram lib
 * when called from context that has access to Telegram.
 */

const PREFIX = 'polybot'

export function getStorageKey(suffix: string, userIdScope: string): string {
  return `${PREFIX}_${suffix}_${userIdScope}`
}

export function loadBalance(userIdScope: string): number | null {
  try {
    const raw = localStorage.getItem(getStorageKey('balance', userIdScope))
    if (raw == null) return null
    const n = parseFloat(raw)
    return Number.isFinite(n) ? n : null
  } catch {
    return null
  }
}

export function saveBalance(userIdScope: string, value: number): void {
  try {
    localStorage.setItem(getStorageKey('balance', userIdScope), String(value))
  } catch {}
}

export function loadHistory(userIdScope: string): Array<{
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
    const raw = localStorage.getItem(getStorageKey('history', userIdScope))
    if (raw == null) return null
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function saveHistory(userIdScope: string, history: Array<{
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
    localStorage.setItem(getStorageKey('history', userIdScope), JSON.stringify(history))
  } catch {}
}

export function loadTotalDeposited(userIdScope: string): number | null {
  try {
    const raw = localStorage.getItem(getStorageKey('deposited', userIdScope))
    if (raw == null) return null
    const n = parseFloat(raw)
    return Number.isFinite(n) && n >= 0 ? n : null
  } catch {
    return null
  }
}

export function saveTotalDeposited(userIdScope: string, value: number): void {
  try {
    localStorage.setItem(getStorageKey('deposited', userIdScope), String(Math.max(0, value)))
  } catch {}
}
