import WebApp from '@twa-dev/sdk'

/**
 * Initialize Telegram Web App: expand viewport, apply theme, etc.
 */
export function initTelegram(): void {
  if (typeof window === 'undefined') return
  WebApp.ready()
  WebApp.expand()
  WebApp.disableVerticalSwipes()
  // Use Telegram's theme colors
  document.documentElement.style.setProperty('--tg-theme-bg-color', WebApp.themeParams.bg_color || '#0f0f0f')
  document.documentElement.style.setProperty('--tg-theme-text-color', WebApp.themeParams.text_color || '#ffffff')
}
