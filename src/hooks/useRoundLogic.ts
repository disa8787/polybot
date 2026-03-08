/**
 * Round logic synced with chart timeframe (1m or 5m).
 * Mark = BTC price at round start.
 */

import { useEffect, useRef, useState } from 'react'
import type { Timeframe } from './usePriceStream'

const INTERVAL_MS: Record<Timeframe, number> = {
  '1m': 60 * 1000,
  '5m': 5 * 60 * 1000,
}

function getRoundEndTime(intervalMs: number): number {
  const now = Date.now()
  const aligned = Math.floor(now / intervalMs) * intervalMs
  return aligned + intervalMs
}

export function useRoundLogic(
  livePriceRef: React.MutableRefObject<number | null>,
  onRoundEnd: (closePrice: number, newMark: number) => void,
  timeframe: Timeframe,
  isConnected?: boolean
) {
  const intervalMs = INTERVAL_MS[timeframe]
  const [roundEndTime, setRoundEndTime] = useState(() => getRoundEndTime(intervalMs))
  const [secondsLeft, setSecondsLeft] = useState(() =>
    Math.max(0, Math.floor((getRoundEndTime(intervalMs) - Date.now()) / 1000))
  )
  const [mark, setMark] = useState<number | null>(null)
  const hasInitializedMark = useRef(false)
  const lastFiredRoundEnd = useRef(0)
  const onRoundEndRef = useRef(onRoundEnd)
  onRoundEndRef.current = onRoundEnd

  // Reset mark init when timeframe changes (new round cycle)
  useEffect(() => {
    hasInitializedMark.current = false
    setMark(null)
  }, [timeframe])

  useEffect(() => {
    if (hasInitializedMark.current || mark != null) return
    if (isConnected === false) return
    const price = livePriceRef.current
    if (price != null && price > 0) {
      hasInitializedMark.current = true
      setMark(price)
    }
  }, [livePriceRef, mark, isConnected, timeframe])

  useEffect(() => {
    const tick = () => {
      const end = getRoundEndTime(intervalMs)
      const left = Math.max(0, Math.floor((end - Date.now()) / 1000))
      setRoundEndTime(end)
      setSecondsLeft(left)

      if (left === 0) {
        if (end !== lastFiredRoundEnd.current) {
          lastFiredRoundEnd.current = end
          const closePrice = livePriceRef.current ?? 0
          if (closePrice > 0) {
            onRoundEndRef.current(closePrice, closePrice)
            setMark(closePrice)
          }
        }
      }
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [livePriceRef, intervalMs])

  return { roundEndTime, secondsLeft, mark }
}
