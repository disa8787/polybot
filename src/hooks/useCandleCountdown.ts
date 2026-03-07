import { useEffect, useState } from 'react'

/**
 * Get the Unix timestamp (ms) when the current 5m candle closes.
 * Binance 5m candles open at :00, :05, :10, :15, :20, :25, :30, :35, :40, :45, :50, :55
 */
export function getNextCandleCloseTime(): number {
  const now = Date.now()
  const minute = 60 * 1000
  const fiveMinutes = 5 * minute
  const aligned = Math.floor(now / fiveMinutes) * fiveMinutes
  return aligned + fiveMinutes
}

/**
 * Returns seconds remaining until the next 5m candle close.
 */
export function useCandleCountdown(): { secondsLeft: number; closeTime: number } {
  const closeTime = getNextCandleCloseTime()
  const [secondsLeft, setSecondsLeft] = useState(() =>
    Math.max(0, Math.floor((closeTime - Date.now()) / 1000))
  )

  useEffect(() => {
    const tick = () => {
      const left = Math.max(0, Math.floor((closeTime - Date.now()) / 1000))
      setSecondsLeft(left)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [closeTime])

  return { secondsLeft, closeTime }
}
