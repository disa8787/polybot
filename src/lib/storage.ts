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

/** Bot session: equity curve, PnL, orders, wins. Rebuilds chart on reload. */
export interface BotSessionData {
  equityData: Array<{ time: number; value: number }>
  sessionTotalProfit: number
  sessionOrders: number
  sessionWins: number
  sessionStartingBalance: number
}

export function loadBotSession(userIdScope: string): BotSessionData | null {
  try {
    const raw = localStorage.getItem(getStorageKey('bot_session', userIdScope))
    if (raw == null) return null
    const parsed = JSON.parse(raw) as BotSessionData
    if (!parsed || !Array.isArray(parsed.equityData)) return null
    return {
      equityData: parsed.equityData,
      sessionTotalProfit: Number(parsed.sessionTotalProfit) || 0,
      sessionOrders: Number(parsed.sessionOrders) || 0,
      sessionWins: Number(parsed.sessionWins) || 0,
      sessionStartingBalance: Number(parsed.sessionStartingBalance) || 0,
    }
  } catch {
    return null
  }
}

export function saveBotSession(userIdScope: string, data: BotSessionData): void {
  try {
    localStorage.setItem(getStorageKey('bot_session', userIdScope), JSON.stringify(data))
  } catch {}
}
