/**
 * Bot API for syncing balance and PnL with the backend.
 * Endpoint: https://unresplendent-portulacaceous-case.ngrok-free.dev/get_user_data?user_id=${userId}
 */

export interface UserData {
  user_id?: number
  balance: number
  pnl_today: number
  pnl_total?: number
  pnl_percent?: number
  language?: string
}

const API_URL = 'https://unresplendent-portulacaceous-case.ngrok-free.dev'

function isNgrokUrl(base: string): boolean {
  return base.includes('ngrok-free.app') || base.includes('ngrok-free.dev')
}

/**
 * Fetches user data from the backend API. Called on app load when userId exists.
 */
export async function syncUserData(userId: number): Promise<UserData | null> {
  const url = `${API_URL}/get_user_data?user_id=${userId}`
  console.log('Fetching for user:', userId)
  try {
    const headers: HeadersInit = {}
    if (isNgrokUrl(API_URL)) {
      headers['Ngrok-Skip-Browser-Warning'] = 'true'
    }
    const res = await fetch(url, { headers })
    const raw = await res.text()
    if (!res.ok) {
      console.warn('[API] syncUserData failed: status', res.status, raw)
      return null
    }
    const data = JSON.parse(raw) as UserData
    if (typeof data.balance !== 'number' || Number.isNaN(data.balance)) {
      data.balance = 0
    }
    if (typeof data.pnl_today !== 'number' || Number.isNaN(data.pnl_today)) {
      data.pnl_today = 0
    }
    if (typeof data.pnl_percent !== 'number' || Number.isNaN(data.pnl_percent)) {
      data.pnl_percent = 0
    }
    if (typeof data.pnl_total !== 'number' || Number.isNaN(data.pnl_total)) {
      data.pnl_total = 0
    }
    console.log('API Response:', data)
    return data
  } catch (err) {
    console.warn('[API] syncUserData failed:', err)
    return null
  }
}

/** @deprecated Use syncUserData */
export async function fetchUserData(userId: number): Promise<UserData | null> {
  return syncUserData(userId)
}

export async function updateUserData(
  userId: number,
  data: { balance?: number; pnl_today?: number; pnl_total?: number }
): Promise<boolean> {
  const url = `${API_URL}/update_user_data`
  console.log('[API] POST', url, { user_id: userId, ...data })
  const headers: HeadersInit = { 'Content-Type': 'application/json' }
  if (isNgrokUrl(API_URL)) {
    headers['Ngrok-Skip-Browser-Warning'] = 'true'
  }
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ user_id: userId, ...data }),
    })
    const ok = res.ok
    if (!ok) {
      const text = await res.text()
      console.warn('[API] updateUserData failed: status', res.status, text)
    }
    return ok
  } catch (err) {
    console.warn('[API] updateUserData failed:', err)
    return false
  }
}
