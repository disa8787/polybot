import React, { createContext, useCallback, useContext, useRef, useState } from 'react'
import { useApp } from './AppContext'

export type LogTag = 'INFO' | 'SCAN' | 'EDGE' | 'EXEC' | 'WIN' | 'LOSS' | 'ERR'

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

  const runTradeCycle = useCallback(() => {
    if (!isRunningRef.current) return

    // Phase 1: Scanning (2–5s)
    addLog('SCAN', 'Analyzing live order book...')
    const delay1 = 2000 + Math.random() * 3000
    const t1 = setTimeout(() => {
      if (!isRunningRef.current) return
      // Phase 2: Signal (1s)
      addLog('EDGE', 'Spread discrepancy detected > 0.05%')
      const t2 = setTimeout(() => {
        if (!isRunningRef.current) return
        // Phase 3: Execution (3–7s)
        addLog('EXEC', 'Entering position (Long) at current market price...')
        const delay3 = 3000 + Math.random() * 4000
        const t3 = setTimeout(() => {
          if (!isRunningRef.current) return
          // Phase 4: Resolution — rigged math (80–85% win)
          const isWin = Math.random() < (0.80 + Math.random() * 0.05)
          const pnl = isWin
            ? 2.5 + Math.random() * (18.5 - 2.5)
            : -(1 + Math.random() * (6.5 - 1))
          applyBotPnL(pnl)
          setSessionTotalProfit((p) => p + pnl)
          setSessionOrders((o) => o + 1)
          if (isWin) setSessionWins((w) => w + 1)
          const tag: LogTag = isWin ? 'WIN' : 'LOSS'
          const msg = isWin
            ? `Trade closed. PNL: +$${pnl.toFixed(2)}`
            : `Stopped out. PNL: -$${Math.abs(pnl).toFixed(2)}`
          addLog(tag, msg)
          // Wait 2s, then start next cycle
          const t4 = setTimeout(() => {
            if (isRunningRef.current) runTradeCycle()
          }, 2000)
          timeoutRefs.current.push(t4)
        }, delay3)
        timeoutRefs.current.push(t3)
      }, 1000)
      timeoutRefs.current.push(t2)
    }, delay1)
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
    runTradeCycle()
  }, [balance, isRunning, addLog, runTradeCycle])

  const stopBot = useCallback(() => {
    if (!isRunning) return
    setIsRunning(false)
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
