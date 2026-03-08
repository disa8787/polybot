import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useApp } from './AppContext'
import { useTelegram } from './TelegramContext'
import * as storage from '../lib/storage'

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
  sessionWins: number
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

/** Micro-scalping: 65% win, 35% loss. Win: 0.01–0.15% of balance. Loss: 0.01–0.08% of balance. */
function computePnL(bal: number): { pnl: number; isWin: boolean } {
  const isWin = Math.random() < 0.65
  if (isWin) {
    const pct = 0.0001 + Math.random() * (0.0015 - 0.0001)
    return { pnl: Math.max(0, bal * pct), isWin: true }
  }
  const pct = 0.0001 + Math.random() * (0.0008 - 0.0001)
  return { pnl: -Math.max(0, bal * pct), isWin: false }
}

export function BotProvider({ children }: { children: React.ReactNode }) {
  const { userId, isReady } = useTelegram()
  const { balance, applyBotPnL } = useApp()
  const scope = userId ?? 'dev'

  const [isRunning, setIsRunning] = useState(false)
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([])
  const [sessionTotalProfit, setSessionTotalProfit] = useState(0)
  const [sessionOrders, setSessionOrders] = useState(0)
  const [sessionWins, setSessionWins] = useState(0)
  const [sessionStartingBalance, setSessionStartingBalance] = useState(0)
  const [equityData, setEquityData] = useState<EquityPoint[]>([])
  const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([])
  const isRunningRef = useRef(false)
  const balanceRef = useRef(balance)
  const hasHydratedBot = useRef(false)

  isRunningRef.current = isRunning
  balanceRef.current = balance

  useEffect(() => {
    if (!isReady || hasHydratedBot.current) return
    const loaded = storage.loadBotSession(scope)
    if (loaded) {
      setEquityData(loaded.equityData)
      setSessionTotalProfit(loaded.sessionTotalProfit)
      setSessionOrders(loaded.sessionOrders)
      setSessionWins(loaded.sessionWins)
      setSessionStartingBalance(loaded.sessionStartingBalance)
    }
    hasHydratedBot.current = true
  }, [isReady, scope])

  const addLog = useCallback((tag: LogTag, message: string) => {
    const id = `log_${Date.now()}_${Math.random().toString(36).slice(2)}`
    setConsoleLogs((prev) => [...prev, { id, timestamp: formatTime(), tag, message }])
  }, [])

  const persistSession = useCallback(
    (equity: EquityPoint[], profit: number, orders: number, wins: number, startBal: number) => {
      storage.saveBotSession(scope, {
        equityData: equity,
        sessionTotalProfit: profit,
        sessionOrders: orders,
        sessionWins: wins,
        sessionStartingBalance: startBal,
      })
    },
    [scope]
  )

  const runTick = useCallback(() => {
    if (!isRunningRef.current) return

    const bal = balanceRef.current
    if (bal <= 0) return

    const { pnl, isWin } = computePnL(bal)
    const newBal = Math.max(0, bal + pnl)

    applyBotPnL(pnl)
    setSessionTotalProfit((p) => p + pnl)
    setSessionOrders((o) => o + 1)
    if (isWin) setSessionWins((w) => w + 1)

    if (isWin) {
      addLog('FILLED', `+$${pnl.toFixed(2)} // market converged`)
    } else {
      addLog('SLIPPED', `-$${Math.abs(pnl).toFixed(2)} // adverse fill`)
    }

    const time = Math.floor(Date.now() / 1000)
    setEquityData((prev) => {
      const next = prev.length ? [...prev, { time, value: newBal }] : [{ time, value: newBal }]
      persistSession(
        next,
        sessionTotalProfit + pnl,
        sessionOrders + 1,
        sessionWins + (isWin ? 1 : 0),
        sessionStartingBalance
      )
      return next
    })

    const cooldownMs = 3000 + Math.random() * 3000
    const t = setTimeout(() => {
      if (!isRunningRef.current) return
      addLog('INFO', pick(INFO_PHRASES))
      const t2 = setTimeout(() => {
        if (!isRunningRef.current) return
        addLog('EXEC', 'Executing arb leg on CLOB...')
        const t3 = setTimeout(() => {
          if (isRunningRef.current) runTick()
        }, 600 + Math.random() * 400)
        timeoutRefs.current.push(t3)
      }, 400 + Math.random() * 400)
      timeoutRefs.current.push(t2)
    }, cooldownMs)
    timeoutRefs.current.push(t)
  }, [addLog, applyBotPnL, persistSession, sessionTotalProfit, sessionOrders, sessionWins, sessionStartingBalance])

  const startBot = useCallback(() => {
    if (balance <= 0) {
      addLog('ERR', 'INSUFFICIENT FUNDS TO START')
      return
    }
    if (isRunning) return
    setIsRunning(true)
    const time = Math.floor(Date.now() / 1000)
    const initial = [{ time, value: balance }]
    setSessionStartingBalance(balance)
    setSessionTotalProfit(0)
    setSessionOrders(0)
    setSessionWins(0)
    setEquityData(initial)
    persistSession(initial, 0, 0, 0, balance)
    addLog('INFO', 'Arb engine started. Monitoring CLOB/AMM spreads.')
    addLog('INFO', pick(INFO_PHRASES))

    const delay = 800 + Math.random() * 600
    const t = setTimeout(() => {
      if (!isRunningRef.current) return
      addLog('EXEC', 'Executing arb leg on CLOB...')
      const t2 = setTimeout(() => {
        if (isRunningRef.current) runTick()
      }, 600)
      timeoutRefs.current.push(t2)
    }, delay)
    timeoutRefs.current.push(t)
  }, [balance, isRunning, addLog, runTick, persistSession])

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
        sessionWins,
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
