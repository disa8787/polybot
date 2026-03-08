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

/**
 * Compute PNL stats. PNL % is based on totalDeposited (not bet amounts).
 * If totalDeposited is 0, pnlPercent is 0 to avoid division by zero.
 */
export function computePNLStats(
  history: ResolvedBet[],
  totalDeposited: number
): PNLStats {
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
  const pnlPercent =
    totalDeposited > 0 ? (netPnL / totalDeposited) * 100 : 0

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
