import React, { createContext, useCallback, useContext, useReducer } from 'react'
import type { ActiveBet, PendingBet, ResolvedBet } from '../types'

const INITIAL_BALANCE = 1000
const ODDS_MULTIPLIER = 1.9

type AppState = {
  balance: number
  pendingBets: PendingBet[]
  activeBets: ActiveBet[]
  history: ResolvedBet[]
}

type Action =
  | { type: 'PLACE_PENDING_BET'; payload: PendingBet }
  | { type: 'ROUND_END'; payload: { closePrice: number; newMark: number } }
  | { type: 'ADD_TO_HISTORY'; payload: ResolvedBet }

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
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
    case 'ROUND_END': {
      const { closePrice, newMark } = action.payload
      // Resolve active bets (compare close price to round's Mark)
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

      // Move pending → active for the NEW round (newMark = strike for this round)
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
    default:
      return state
  }
}

/** When round ends, we need to set the mark on the newly activated bets */
type AppContextValue = {
  balance: number
  pendingBets: PendingBet[]
  activeBets: ActiveBet[]
  history: ResolvedBet[]
  placePendingBet: (bet: Omit<PendingBet, 'id'>) => boolean
  onRoundEnd: (closePrice: number, newMark: number) => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    balance: INITIAL_BALANCE,
    pendingBets: [],
    activeBets: [],
    history: [],
  })

  const placePendingBet = useCallback((bet: Omit<PendingBet, 'id'>): boolean => {
    if (state.balance < bet.amount) return false
    const id = `bet_${Date.now()}_${Math.random().toString(36).slice(2)}`
    dispatch({ type: 'PLACE_PENDING_BET', payload: { ...bet, id } })
    return true
  }, [state.balance])

  const onRoundEnd = useCallback((closePrice: number, newMark: number) => {
    dispatch({ type: 'ROUND_END', payload: { closePrice, newMark } })
  }, [])

  return (
    <AppContext.Provider
      value={{
        balance: state.balance,
        pendingBets: state.pendingBets,
        activeBets: state.activeBets,
        history: state.history,
        placePendingBet,
        onRoundEnd,
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
