/**
 * Strict 5-minute round logic for Polymarket-style prediction market.
 * Rounds are globally aligned (e.g. 12:00:00 - 12:05:00, 12:05:00 - 12:10:00).
 * Mark = BTC price captured at the exact moment a round starts.
 */

import { useEffect, useRef, useState } from 'react'

const FIVE_MIN_MS = 5 * 60 * 1000

/** Get the Unix timestamp (ms) when the current 5m round ends */
export function getRoundEndTime(): number {
  const now = Date.now()
  const aligned = Math.floor(now / FIVE_MIN_MS) * FIVE_MIN_MS
  return aligned + FIVE_MIN_MS
}

/** Get the Unix timestamp (ms) when the current 5m round started */
export function getRoundStartTime(): number {
  const now = Date.now()
  return Math.floor(now / FIVE_MIN_MS) * FIVE_MIN_MS
}

export interface RoundState {
  roundEndTime: number
  secondsLeft: number
  mark: number | null
}

/**
 * Tracks round boundaries, countdown, and Mark.
 * Calls onRoundEnd(closePrice, newMark) when the round ends so the parent can resolve bets.
 * newMark = closePrice (price at round boundary becomes next round's strike).
 */
export function useRoundLogic(
  livePriceRef: React.MutableRefObject<number | null>,
  onRoundEnd: (closePrice: number, newMark: number) => void,
  isConnected?: boolean
) {
  const [roundEndTime, setRoundEndTime] = useState(getRoundEndTime)
  const [secondsLeft, setSecondsLeft] = useState(() =>
    Math.max(0, Math.floor((getRoundEndTime() - Date.now()) / 1000))
  )
  const [mark, setMark] = useState<number | null>(null)
  const hasInitializedMark = useRef(false)
  const lastFiredRoundEnd = useRef(0)
  const onRoundEndRef = useRef(onRoundEnd)
  onRoundEndRef.current = onRoundEnd

  // Initialize Mark when we first get a price (after WebSocket connects)
  useEffect(() => {
    if (hasInitializedMark.current || mark != null) return
    if (isConnected === false) return
    const price = livePriceRef.current
    if (price != null && price > 0) {
      hasInitializedMark.current = true
      setMark(price)
    }
  }, [livePriceRef, mark, isConnected])

  // Countdown tick
  useEffect(() => {
    const tick = () => {
      const end = getRoundEndTime()
      const left = Math.max(0, Math.floor((end - Date.now()) / 1000))
      setRoundEndTime(end)
      setSecondsLeft(left)

      // Round just ended (fire once per boundary)
      if (left === 0) {
        const end = getRoundEndTime()
        if (end !== lastFiredRoundEnd.current) {
          lastFiredRoundEnd.current = end
          const closePrice = livePriceRef.current ?? 0
          if (closePrice > 0) {
            onRoundEndRef.current(closePrice, closePrice) // newMark = closePrice
            setMark(closePrice) // New Mark for next round
          }
        }
      }
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [livePriceRef])

  return { roundEndTime, secondsLeft, mark }
}
