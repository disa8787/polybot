import React, { createContext, useCallback, useContext, useReducer } from 'react'
import type { ActiveBet, ResolvedBet } from '../types'

const INITIAL_BALANCE = 1000
const ODDS_MULTIPLIER = 1.9

type AppState = {
  balance: number
  activeBets: ActiveBet[]
  history: ResolvedBet[]
}

type Action =
  | { type: 'PLACE_BET'; payload: ActiveBet }
  | { type: 'RESOLVE_BET'; payload: { bet: ActiveBet; closePrice: number } }
  | { type: 'ADD_TO_HISTORY'; payload: ResolvedBet }

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'PLACE_BET': {
      const bet = action.payload
      const newBalance = state.balance - bet.amount
      if (newBalance < 0) return state
      return {
        ...state,
        balance: newBalance,
        activeBets: [...state.activeBets, bet],
      }
    }
    case 'RESOLVE_BET': {
      const { bet, closePrice } = action.payload
      const won = bet.type === 'yes' ? closePrice > bet.entryPrice : closePrice <= bet.entryPrice
      const payout = won ? bet.amount * ODDS_MULTIPLIER : 0
      return {
        ...state,
        balance: state.balance + payout,
        activeBets: state.activeBets.filter((b) => b.id !== bet.id),
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

type AppContextValue = {
  balance: number
  activeBets: ActiveBet[]
  history: ResolvedBet[]
  placeBet: (bet: Omit<ActiveBet, 'id'>) => boolean
  resolveBet: (bet: ActiveBet, closePrice: number) => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    balance: INITIAL_BALANCE,
    activeBets: [],
    history: [],
  })

  const placeBet = useCallback((bet: Omit<ActiveBet, 'id'>): boolean => {
    if (state.balance < bet.amount) return false
    const id = `bet_${Date.now()}_${Math.random().toString(36).slice(2)}`
    dispatch({ type: 'PLACE_BET', payload: { ...bet, id } })
    return true
  }, [state.balance])

  const resolveBet = useCallback((bet: ActiveBet, closePrice: number) => {
    const won = bet.type === 'yes' ? closePrice > bet.entryPrice : closePrice <= bet.entryPrice
    const payout = won ? bet.amount * ODDS_MULTIPLIER : 0
    dispatch({ type: 'RESOLVE_BET', payload: { bet, closePrice } })
    dispatch({
      type: 'ADD_TO_HISTORY',
      payload: {
        id: bet.id,
        type: bet.type,
        amount: bet.amount,
        entryPrice: bet.entryPrice,
        closePrice,
        won,
        payout,
        resolvedAt: Date.now(),
      },
    })
  }, [])

  return (
    <AppContext.Provider
      value={{
        balance: state.balance,
        activeBets: state.activeBets,
        history: state.history,
        placeBet,
        resolveBet,
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
