import React, { createContext, useCallback, useContext, useEffect, useReducer } from 'react'
import type { ActiveBet, PendingBet, ResolvedBet } from '../types'
import * as api from '../lib/api'
import * as storage from '../lib/storage'
import { useTelegram } from './TelegramContext'

const INITIAL_BALANCE = 0
const ODDS_MULTIPLIER = 1.9

type AppState = {
  balance: number
  totalDeposited: number
  apiPnlToday: number
  apiPnlPercent: number
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
  | { type: 'HYDRATE'; payload: Pick<AppState, 'balance' | 'totalDeposited' | 'history' | 'apiPnlToday' | 'apiPnlPercent'> }
  | { type: 'API_SYNC'; payload: { balance: number; pnl_today: number; pnl_percent: number } }
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
        apiPnlToday: action.payload.apiPnlToday ?? 0,
        apiPnlPercent: action.payload.apiPnlPercent ?? 0,
      }
    }
    case 'API_SYNC': {
      return {
        ...state,
        balance: action.payload.balance,
        apiPnlToday: action.payload.pnl_today,
        apiPnlPercent: action.payload.pnl_percent,
      }
    }
    default:
      return state
  }
}

type AppContextValue = {
  balance: number
  totalDeposited: number
  apiPnlToday: number
  apiPnlPercent: number
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
  apiPnlToday: 0,
  apiPnlPercent: 0,
  pendingBets: [],
  activeBets: [],
  history: [],
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { userId, isReady } = useTelegram()
  const [state, dispatch] = useReducer(reducer, DEFAULT_STATE)
  const hasHydrated = React.useRef(false)

  // Hydrate from Bot API (source of truth) on load. Uses initDataUnsafe.user.id via userId.
  useEffect(() => {
    if (!isReady || hasHydrated.current) return
    const scope = userId ?? 'dev'
    const history = (storage.loadHistory(scope) as ResolvedBet[]) ?? []
    const totalDeposited = storage.loadTotalDeposited(scope) ?? 0

    const hydrate = (balance: number, apiPnlToday = 0, apiPnlPercent = 0) => {
      dispatch({
        type: 'HYDRATE',
        payload: { balance, totalDeposited, history, apiPnlToday, apiPnlPercent },
      })
      hasHydrated.current = true
    }

    if (userId != null) {
      api.syncUserData(Number(userId))
        .then((data) => {
          if (data != null) {
            const balance = Number.isFinite(Number(data.balance)) ? data.balance : (storage.loadBalance(scope) ?? INITIAL_BALANCE)
            const pnlToday: number = typeof data.pnl_today === 'number' && Number.isFinite(data.pnl_today) ? data.pnl_today : 0
            const pnlPercent: number = typeof data.pnl_percent === 'number' && Number.isFinite(data.pnl_percent) ? data.pnl_percent : 0
            dispatch({
              type: 'HYDRATE',
              payload: {
                balance,
                totalDeposited,
                history,
                apiPnlToday: pnlToday,
                apiPnlPercent: pnlPercent,
              },
            })
            hasHydrated.current = true
          } else {
            hydrate(storage.loadBalance(scope) ?? INITIAL_BALANCE)
          }
        })
        .catch(() => {
          hydrate(storage.loadBalance(scope) ?? INITIAL_BALANCE)
        })
    } else {
      hydrate(storage.loadBalance(scope) ?? INITIAL_BALANCE)
    }
  }, [isReady, userId])

  const scope = (userId ?? 'dev')

  // Persist to localStorage and sync to Bot API when balance changes (only after hydration)
  useEffect(() => {
    if (!hasHydrated.current) return
    storage.saveBalance(scope, state.balance)
    if (userId != null) {
      api.updateUserData(Number(userId), { balance: state.balance }).catch(() => {})
    }
  }, [scope, state.balance, userId])

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
        apiPnlToday: state.apiPnlToday,
        apiPnlPercent: state.apiPnlPercent,
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
