import React, { createContext, useCallback, useContext, useRef, useState } from 'react'
import { useApp } from './AppContext'

export type LogTag = 'INFO' | 'SCAN' | 'OK' | 'EDGE' | 'ERR'

export interface ConsoleLog {
  id: string
  timestamp: string
  tag: LogTag
  message: string
}

type BotContextValue = {
  isRunning: boolean
  consoleLogs: ConsoleLog[]
  sessionTotalProfit: number
  sessionOrders: number
  sessionWins: number
  startBot: () => void
  stopBot: () => void
  addLog: (tag: LogTag, message: string) => void
}

const BotContext = createContext<BotContextValue | null>(null)

function formatTime(): string {
  const d = new Date()
  return d.toTimeString().slice(0, 8)
}

export function BotProvider({ children }: { children: React.ReactNode }) {
  const { balance, applyBotPnL } = useApp()
  const [isRunning, setIsRunning] = useState(false)
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([])
  const [sessionTotalProfit, setSessionTotalProfit] = useState(0)
  const [sessionOrders, setSessionOrders] = useState(0)
  const [sessionWins, setSessionWins] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([])
  const isRunningRef = useRef(false)
  isRunningRef.current = isRunning

  const addLog = useCallback((tag: LogTag, message: string) => {
    const id = `log_${Date.now()}_${Math.random().toString(36).slice(2)}`
    setConsoleLogs((prev) => [
      ...prev,
      { id, timestamp: formatTime(), tag, message },
    ])
  }, [])

  const runTrade = useCallback(() => {
    addLog('SCAN', 'Analyzing 5m BTC order book...')
    const t1 = setTimeout(() => {
      addLog('EDGE', 'Edge detected! Spread > threshold. Entering position.')
      const t2 = setTimeout(() => {
        const isWin = Math.random() < 0.85
        const pnl = isWin
          ? 2.5 + Math.random() * (18 - 2.5)
          : -(1 + Math.random() * (5 - 1))
        applyBotPnL(pnl)
        setSessionTotalProfit((p) => p + pnl)
        setSessionOrders((o) => o + 1)
        if (isWin) setSessionWins((w) => w + 1)
        const sign = pnl >= 0 ? '+' : ''
        addLog('OK', `Trade closed. PNL: ${sign}$${pnl.toFixed(2)}`)
      }, 2000)
      timeoutRefs.current.push(t2)
    }, 1000)
    timeoutRefs.current.push(t1)
  }, [addLog, applyBotPnL])

  const startBot = useCallback(() => {
    if (balance <= 0) {
      addLog('ERR', 'INSUFFICIENT FUNDS TO START')
      return
    }
    if (isRunning) return
    setIsRunning(true)
    addLog('INFO', 'Bot started. Scanning for edges...')
    const scheduleNext = () => {
      if (!isRunningRef.current) return
      const delay = 4000 + Math.random() * 8000
      intervalRef.current = setTimeout(() => {
        if (!isRunningRef.current) return
        runTrade()
        scheduleNext()
      }, delay)
    }
    scheduleNext()
  }, [balance, isRunning, addLog, runTrade])

  const stopBot = useCallback(() => {
    if (!isRunning) return
    setIsRunning(false)
    if (intervalRef.current) {
      clearTimeout(intervalRef.current)
      intervalRef.current = null
    }
    timeoutRefs.current.forEach(clearTimeout)
    timeoutRefs.current = []
    addLog('INFO', 'Bot stopped.')
  }, [isRunning, addLog])

  return (
    <BotContext.Provider
      value={{
        isRunning,
        consoleLogs,
        sessionTotalProfit,
        sessionOrders,
        sessionWins,
        startBot,
        stopBot,
        addLog,
      }}
    >
      {children}
    </BotContext.Provider>
  )
}

export function useBot() {
  const ctx = useContext(BotContext)
  if (!ctx) throw new Error('useBot must be used within BotProvider')
  return ctx
}
