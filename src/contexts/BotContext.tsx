import React, { createContext, useCallback, useContext, useRef, useState } from 'react'
import { useApp } from './AppContext'

export type LogTag = 'INFO' | 'EXEC' | 'FILLED' | 'SLIPPED' | 'ERR'

export interface ConsoleLog {
  id: string
  timestamp: string
  tag: LogTag
  message: string
}

export interface EquityPoint {
  time: number
  value: number
}

type BotContextValue = {
  isRunning: boolean
  consoleLogs: ConsoleLog[]
  sessionTotalProfit: number
  sessionOrders: number
  sessionStartingBalance: number
  equityData: EquityPoint[]
  startBot: () => void
  stopBot: () => void
}

const BotContext = createContext<BotContextValue | null>(null)

function formatTime(): string {
  const d = new Date()
  return d.toTimeString().slice(0, 8)
}

const INFO_PHRASES = [
  'Checking BTC contracts for divergence...',
  'Evaluating open limit orders on CLOB...',
  'Monitoring order book depth for arb opportunities...',
  'Scanning CLOB vs AMM spread differentials...',
]

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function BotProvider({ children }: { children: React.ReactNode }) {
  const { balance, applyBotPnL } = useApp()
  const [isRunning, setIsRunning] = useState(false)
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([])
  const [sessionTotalProfit, setSessionTotalProfit] = useState(0)
  const [sessionOrders, setSessionOrders] = useState(0)
  const [sessionStartingBalance, setSessionStartingBalance] = useState(0)
  const [equityData, setEquityData] = useState<EquityPoint[]>([])
  const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([])
  const isRunningRef = useRef(false)
  const winsSinceSlipRef = useRef(0)
  const balanceRef = useRef(balance)
  isRunningRef.current = isRunning
  balanceRef.current = balance

  const addLog = useCallback((tag: LogTag, message: string) => {
    const id = `log_${Date.now()}_${Math.random().toString(36).slice(2)}`
    setConsoleLogs((prev) => [...prev, { id, timestamp: formatTime(), tag, message }])
  }, [])

  const addEquityPoint = useCallback((value: number) => {
    const time = Math.floor(Date.now() / 1000)
    setEquityData((prev) => (prev.length ? [...prev, { time, value }] : [{ time, value }]))
  }, [])

  const runTick = useCallback(() => {
    if (!isRunningRef.current) return

    const isFill = Math.random() < 0.85
    let pnl = 0

    if (isFill) {
      pnl = 0.3 + Math.random() * (1.2 - 0.3)
      applyBotPnL(pnl)
      setSessionTotalProfit((p) => p + pnl)
      setSessionOrders((o) => o + 1)
      addLog('FILLED', `+$${pnl.toFixed(2)} // market converged`)
      winsSinceSlipRef.current += 1

      if (winsSinceSlipRef.current >= 6 + Math.floor(Math.random() * 2)) {
        winsSinceSlipRef.current = 0
        const slip = -(0.05 + Math.random() * (0.2 - 0.05))
        applyBotPnL(slip)
        setSessionTotalProfit((p) => p + slip)
        addLog('SLIPPED', `-$${Math.abs(slip).toFixed(2)} // adverse fill`)
        addEquityPoint(balanceRef.current + pnl + slip)
      } else {
        addEquityPoint(balanceRef.current + pnl)
      }
    } else {
      pnl = -(0.05 + Math.random() * (0.2 - 0.05))
      applyBotPnL(pnl)
      setSessionTotalProfit((p) => p + pnl)
      setSessionOrders((o) => o + 1)
      addLog('SLIPPED', `-$${Math.abs(pnl).toFixed(2)} // adverse fill`)
      winsSinceSlipRef.current = 0
      addEquityPoint(balanceRef.current + pnl)
    }

    const delay = 1000 + Math.random() * 1000
    const t = setTimeout(() => {
      if (!isRunningRef.current) return
      addLog('INFO', pick(INFO_PHRASES))
      const t2 = setTimeout(() => {
        if (!isRunningRef.current) return
        addLog('EXEC', 'Executing arb leg on CLOB...')
        const t3 = setTimeout(() => {
          if (isRunningRef.current) runTick()
        }, 500 + Math.random() * 500)
        timeoutRefs.current.push(t3)
      }, 400 + Math.random() * 400)
      timeoutRefs.current.push(t2)
    }, delay)
    timeoutRefs.current.push(t)
  }, [addLog, addEquityPoint, applyBotPnL])

  const startBot = useCallback(() => {
    if (balance <= 0) {
      addLog('ERR', 'INSUFFICIENT FUNDS TO START')
      return
    }
    if (isRunning) return
    setIsRunning(true)
    setSessionStartingBalance(balance)
    winsSinceSlipRef.current = 0
    const time = Math.floor(Date.now() / 1000)
    setEquityData([{ time, value: balance }])
    addLog('INFO', 'Arb engine started. Monitoring CLOB/AMM spreads.')
    addLog('INFO', pick(INFO_PHRASES))
    const delay = 1500 + Math.random() * 1000
    const t = setTimeout(() => {
      if (!isRunningRef.current) return
      addLog('EXEC', 'Executing arb leg on CLOB...')
      const t2 = setTimeout(() => {
        if (isRunningRef.current) runTick()
      }, 600)
      timeoutRefs.current.push(t2)
    }, delay)
    timeoutRefs.current.push(t)
  }, [balance, isRunning, addLog, runTick])

  const stopBot = useCallback(() => {
    if (!isRunning) return
    setIsRunning(false)
    timeoutRefs.current.forEach(clearTimeout)
    timeoutRefs.current = []
    addLog('INFO', 'Arb engine stopped.')
  }, [isRunning, addLog])

  return (
    <BotContext.Provider
      value={{
        isRunning,
        consoleLogs,
        sessionTotalProfit,
        sessionOrders,
        sessionStartingBalance,
        equityData,
        startBot,
        stopBot,
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
