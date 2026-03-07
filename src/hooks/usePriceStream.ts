/**
 * High-frequency BTC price stream for Polymarket-style dynamic chart.
 * Uses Binance 1m kline WebSocket (updates ~every 250ms) and emits each update
 * as a chart tick. Live price is stored in a ref to avoid React re-renders on every tick.
 */

import { useCallback, useEffect, useRef, useState } from 'react'

const BINANCE_WS = 'wss://stream.binance.com:9443/ws/btcusdt@kline_1m'

interface KlineMsg {
  k: {
    t: number
    c: string
  }
}

/** Area chart data point */
export interface ChartTick {
  time: number
  value: number
}

/** Subscribe to chart ticks. Returns unsubscribe. */
export type SubscribeToTick = (callback: (tick: ChartTick) => void) => () => void

/** Fetch initial 1m candles for smooth area chart (Binance min interval is 1m) */
async function fetchInitialAreaData(): Promise<ChartTick[]> {
  const res = await fetch(
    'https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m&limit=120'
  )
  const data = (await res.json()) as [number, string, string, string, string, number][]
  return data.map(([t, , , , c]) => ({
    time: Math.floor(t / 1000),
    value: parseFloat(c),
  }))
}

export function usePriceStream() {
  const [isConnected, setIsConnected] = useState(false)
  const [initialData, setInitialData] = useState<ChartTick[]>([])
  const livePriceRef = useRef<number | null>(null)
  const listenersRef = useRef<Set<(tick: ChartTick) => void>>(new Set())

  const subscribeToTick = useCallback((callback: (tick: ChartTick) => void): (() => void) => {
    listenersRef.current.add(callback)
    return () => {
      listenersRef.current.delete(callback)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function init() {
      const data = await fetchInitialAreaData()
      if (cancelled) return
      setInitialData(data)
      if (data.length) livePriceRef.current = data[data.length - 1].value
    }
    init()

    const ws = new WebSocket(BINANCE_WS)

    ws.onopen = () => {
      if (!cancelled) setIsConnected(true)
    }
    ws.onclose = () => {
      if (!cancelled) setIsConnected(false)
    }
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data) as KlineMsg
      const k = msg.k
      const value = parseFloat(k.c)
      livePriceRef.current = value
      // Use current time for high-frequency ticks (1m stream updates ~250ms)
      const time = Math.floor(Date.now() / 1000)
      const tick: ChartTick = { time, value }
      listenersRef.current.forEach((cb) => cb(tick))
    }

    return () => {
      cancelled = true
      ws.close()
    }
  }, [])

  return {
    initialData,
    subscribeToTick,
    livePriceRef,
    isConnected,
  }
}
