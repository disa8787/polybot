/** Single candlestick (OHLCV) from Binance - kept for REST responses */
export interface Candlestick {
  time: number
  open: number
  high: number
  low: number
  close: number
}

/** Bet placed for the NEXT round (pending until current round ends) */
export interface PendingBet {
  id: string
  type: 'yes' | 'no'
  amount: number
  mark: number // Mark at time of bet (for display - next round's mark not set yet)
  placedAt: number
}

/** Active bet - will be resolved when current round ends */
export interface ActiveBet {
  id: string
  type: 'yes' | 'no'
  amount: number
  mark: number // Round's Mark (strike price)
  placedAt: number
}

/** Resolved bet for history */
export interface ResolvedBet {
  id: string
  type: 'yes' | 'no'
  amount: number
  mark: number
  closePrice: number
  won: boolean
  payout: number
  resolvedAt: number
}
