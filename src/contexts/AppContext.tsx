import React, { createContext, useCallback, useContext, useEffect, useReducer } from 'react'
import type { ActiveBet, PendingBet, ResolvedBet } from '../types'
import * as storage from '../lib/storage'
import { useTelegram } from './TelegramContext'

const INITIAL_BALANCE = 0
const ODDS_MULTIPLIER = 1.9

type AppState = {
  balance: number
  totalDeposited: number
  pendingBets: PendingBet[]
  activeBets: ActiveBet[]
  history: ResolvedBet[]
}

type Action =
  | { type: 'PLACE_PENDING_BET'; payload: PendingBet }
  | { type: 'CANCEL_PENDING_BET'; payload: string }
  | { type: 'DEPOSIT'; payload: number }
  | { type: 'ROUND_END'; payload: { closePrice: number; newMark: number } }
  | { type: 'ADD_TO_HISTORY'; payload: ResolvedBet }
  | { type: 'HYDRATE'; payload: Pick<AppState, 'balance' | 'totalDeposited' | 'history'> }
  | { type: 'BOT_PNL'; payload: number }

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'DEPOSIT': {
      const amount = action.payload
      return {
        ...state,
        balance: state.balance + amount,
        totalDeposited: state.totalDeposited + amount,
      }
    }
    case 'PLACE_PENDING_BET': {
      const bet = action.payload
      const newBalance = state.balance - bet.amount
      if (newBalance < 0) return state
      return {
        ...state,
        balance: newBalance,
        pendingBets: [...state.pendingBets, bet],
      }
    }
    case 'CANCEL_PENDING_BET': {
      const bet = state.pendingBets.find((b) => b.id === action.payload)
      if (!bet) return state
      return {
        ...state,
        balance: state.balance + bet.amount,
        pendingBets: state.pendingBets.filter((b) => b.id !== action.payload),
      }
    }
    case 'ROUND_END': {
      const { closePrice, newMark } = action.payload
      let balance = state.balance
      const resolved: ResolvedBet[] = []

      for (const bet of state.activeBets) {
        const won = bet.type === 'yes' ? closePrice > bet.mark : closePrice <= bet.mark
        const payout = won ? bet.amount * ODDS_MULTIPLIER : 0
        balance += payout
        resolved.push({
          id: bet.id,
          type: bet.type,
          amount: bet.amount,
          mark: bet.mark,
          closePrice,
          won,
          payout,
          resolvedAt: Date.now(),
        })
      }

      const activeBets: ActiveBet[] = state.pendingBets.map((p) => ({
        id: p.id,
        type: p.type,
        amount: p.amount,
        mark: newMark,
        placedAt: p.placedAt,
      }))

      return {
        ...state,
        balance,
        activeBets,
        pendingBets: [],
        history: [...resolved, ...state.history],
      }
    }
    case 'ADD_TO_HISTORY': {
      return {
        ...state,
        history: [action.payload, ...state.history],
      }
    }
    case 'BOT_PNL': {
      return {
        ...state,
        balance: Math.max(0, state.balance + action.payload),
      }
    }
    case 'HYDRATE': {
      return {
        ...state,
        balance: action.payload.balance,
        totalDeposited: action.payload.totalDeposited,
        history: action.payload.history,
      }
    }
    default:
      return state
  }
}

type AppContextValue = {
  balance: number
  totalDeposited: number
  pendingBets: PendingBet[]
  activeBets: ActiveBet[]
  history: ResolvedBet[]
  placePendingBet: (bet: Omit<PendingBet, 'id'>) => boolean
  cancelPendingBet: (betId: string) => void
  deposit: (amount: number) => void
  onRoundEnd: (closePrice: number, newMark: number) => void
  applyBotPnL: (amount: number) => void
}

const AppContext = createContext<AppContextValue | null>(null)

const DEFAULT_STATE: AppState = {
  balance: INITIAL_BALANCE,
  totalDeposited: 0,
  pendingBets: [],
  activeBets: [],
  history: [],
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { userId, isReady } = useTelegram()
  const [state, dispatch] = useReducer(reducer, DEFAULT_STATE)
  const hasHydrated = React.useRef(false)

  // Hydrate from storage ONLY after Telegram is ready and we have a firm userId scope
  useEffect(() => {
    if (!isReady || hasHydrated.current) return
    const scope = userId ?? 'dev'
    const balance = storage.loadBalance(scope)
    const history = storage.loadHistory(scope)
    const totalDeposited = storage.loadTotalDeposited(scope)
    dispatch({
      type: 'HYDRATE',
      payload: {
        balance: balance ?? INITIAL_BALANCE,
        totalDeposited: totalDeposited ?? 0,
        history: (history as ResolvedBet[]) ?? [],
      },
    })
    hasHydrated.current = true
  }, [isReady, userId])

  const scope = (userId ?? 'dev')

  // Persist when state changes (only after hydration)
  useEffect(() => {
    if (!hasHydrated.current) return
    storage.saveBalance(scope, state.balance)
  }, [scope, state.balance])

  useEffect(() => {
    if (!hasHydrated.current) return
    storage.saveHistory(scope, state.history)
  }, [scope, state.history])

  useEffect(() => {
    if (!hasHydrated.current) return
    storage.saveTotalDeposited(scope, state.totalDeposited)
  }, [scope, state.totalDeposited])

  const placePendingBet = useCallback((bet: Omit<PendingBet, 'id'>): boolean => {
    if (state.balance < bet.amount) return false
    const id = `bet_${Date.now()}_${Math.random().toString(36).slice(2)}`
    dispatch({ type: 'PLACE_PENDING_BET', payload: { ...bet, id } })
    return true
  }, [state.balance])

  const cancelPendingBet = useCallback((betId: string) => {
    dispatch({ type: 'CANCEL_PENDING_BET', payload: betId })
  }, [])

  const deposit = useCallback((amount: number) => {
    if (amount > 0) dispatch({ type: 'DEPOSIT', payload: amount })
  }, [])

  const onRoundEnd = useCallback((closePrice: number, newMark: number) => {
    dispatch({ type: 'ROUND_END', payload: { closePrice, newMark } })
  }, [])

  const applyBotPnL = useCallback((amount: number) => {
    dispatch({ type: 'BOT_PNL', payload: amount })
  }, [])

  return (
    <AppContext.Provider
      value={{
        balance: state.balance,
        totalDeposited: state.totalDeposited,
        pendingBets: state.pendingBets,
        activeBets: state.activeBets,
        history: state.history,
        placePendingBet,
        cancelPendingBet,
        deposit,
        onRoundEnd,
        applyBotPnL,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
