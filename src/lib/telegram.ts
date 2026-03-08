import WebApp from '@twa-dev/sdk'

export interface TelegramUser {
  id: number
  first_name?: string
  last_name?: string
  username?: string
  language_code?: string
  is_premium?: boolean
  photo_url?: string
}

/**
 * Initialize Telegram Web App: expand viewport, apply theme.
 * MUST be called before reading any user data.
 */
export function initTelegram(): void {
  if (typeof window === 'undefined') return
  WebApp.ready()
  WebApp.expand()
  WebApp.disableVerticalSwipes()
  const theme = WebApp.themeParams
  if (theme?.bg_color) {
    document.documentElement.style.setProperty('--tg-theme-bg-color', theme.bg_color)
  }
  if (theme?.text_color) {
    document.documentElement.style.setProperty('--tg-theme-text-color', theme.text_color)
  }
}

/**
 * Get user ID from Telegram WebApp. Standard way - no URL params needed.
 * Uses: window.Telegram.WebApp.initDataUnsafe?.user?.id
 */
export function getUserId(): number | null {
  if (typeof window === 'undefined') return null
  const tg = (window as unknown as { Telegram?: { WebApp?: { initDataUnsafe?: { user?: { id?: number } } } } }).Telegram
  const userId = tg?.WebApp?.initDataUnsafe?.user?.id
  return typeof userId === 'number' ? userId : null
}

/**
 * Extract full user from initDataUnsafe. Returns null if not available.
 */
export function getTelegramUser(): TelegramUser | null {
  const id = getUserId()
  if (id == null) return null
  const tg = (window as any).Telegram
  const raw = tg?.WebApp?.initDataUnsafe?.user
  if (!raw || typeof raw !== 'object') return { id }
  const u = raw as Record<string, unknown>
  return {
    id,
    first_name: typeof u.first_name === 'string' ? u.first_name : undefined,
    last_name: typeof u.last_name === 'string' ? u.last_name : undefined,
    username: typeof u.username === 'string' ? u.username : undefined,
    language_code: typeof u.language_code === 'string' ? u.language_code : undefined,
    is_premium: typeof u.is_premium === 'boolean' ? u.is_premium : undefined,
    photo_url: typeof u.photo_url === 'string' ? u.photo_url : undefined,
  }
}

/**
 * Get storage scope: userId string or 'dev' when no Telegram user.
 */
export function getUserIdForStorage(): string {
  const userId = getUserId()
  return userId != null ? String(userId) : 'dev'
}
