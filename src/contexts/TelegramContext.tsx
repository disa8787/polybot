import React, { createContext, useContext, useEffect, useState } from 'react'
import { initTelegram, getTelegramUser, type TelegramUser } from '../lib/telegram'

const POLL_MS = 100
const MAX_WAIT_MS = 3000

type TelegramContextValue = {
  user: TelegramUser | null
  userId: string | null
  isReady: boolean
  debugLabel: string
}

const TelegramContext = createContext<TelegramContextValue | null>(null)

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<TelegramUser | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    initTelegram()

    let elapsed = 0
    const check = () => {
      const u = getTelegramUser()
      if (u != null) {
        setUser(u)
        setIsReady(true)
        return
      }
      elapsed += POLL_MS
      if (elapsed < MAX_WAIT_MS) {
        setTimeout(check, POLL_MS)
      } else {
        setIsReady(true)
      }
    }
    check()
  }, [])

  const userId = user != null ? String(user.id) : null
  const debugLabel = userId != null ? `id:${userId}` : 'NO_TG_DATA'

  return (
    <TelegramContext.Provider
      value={{
        user,
        userId,
        isReady,
        debugLabel,
      }}
    >
      {children}
    </TelegramContext.Provider>
  )
}

export function useTelegram() {
  const ctx = useContext(TelegramContext)
  if (!ctx) throw new Error('useTelegram must be used within TelegramProvider')
  return ctx
}
