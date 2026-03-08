import type { ResolvedBet } from '../types'

export interface PNLStats {
  totalBets: number
  wins: number
  winRate: number
  totalWagered: number
  totalReturned: number
  netPnL: number
  pnlPercent: number
}

export function computePNLStats(history: ResolvedBet[]): PNLStats {
  if (!history.length) {
    return {
      totalBets: 0,
      wins: 0,
      winRate: 0,
      totalWagered: 0,
      totalReturned: 0,
      netPnL: 0,
      pnlPercent: 0,
    }
  }

  let wins = 0
  let totalWagered = 0
  let totalReturned = 0

  for (const bet of history) {
    totalWagered += bet.amount
    totalReturned += bet.payout
    if (bet.won) wins++
  }

  const netPnL = totalReturned - totalWagered
  const pnlPercent = totalWagered > 0 ? (netPnL / totalWagered) * 100 : 0

  return {
    totalBets: history.length,
    wins,
    winRate: history.length > 0 ? (wins / history.length) * 100 : 0,
    totalWagered,
    totalReturned,
    netPnL,
    pnlPercent,
  }
}
