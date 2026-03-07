/** Single candlestick (OHLCV) from Binance */
export interface Candlestick {
  time: number
  open: number
  high: number
  low: number
  close: number
}

/** Active prediction awaiting resolution */
export interface ActiveBet {
  id: string
  type: 'yes' | 'no'
  amount: number
  entryPrice: number
  candleCloseTime: number // unix ms when candle closes
  placedAt: number
}

/** Resolved bet for history */
export interface ResolvedBet {
  id: string
  type: 'yes' | 'no'
  amount: number
  entryPrice: number
  closePrice: number
  won: boolean
  payout: number
  resolvedAt: number
}
