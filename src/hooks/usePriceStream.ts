/**
 * BTC price stream for dynamic chart. Supports 1m or 5m timeframe.
 * WebSocket and chart data are cleaned up when timeframe switches.
 */

import { useCallback, useEffect, useRef, useState } from 'react'

export type Timeframe = '1m' | '5m'

const WS_URL: Record<Timeframe, string> = {
  '1m': 'wss://stream.binance.com:9443/ws/btcusdt@kline_1m',
  '5m': 'wss://stream.binance.com:9443/ws/btcusdt@kline_5m',
}

const REST_INTERVAL: Record<Timeframe, string> = {
  '1m': '1m',
  '5m': '5m',
}

interface KlineMsg {
  k: { t: number; c: string }
}

export interface ChartTick {
  time: number
  value: number
}

export type SubscribeToTick = (callback: (tick: ChartTick) => void) => () => void

async function fetchInitialAreaData(interval: string): Promise<ChartTick[]> {
  const limit = interval === '1m' ? 120 : 100
  const res = await fetch(
    `https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=${interval}&limit=${limit}`
  )
  const data = (await res.json()) as [number, string, string, string, string, number][]
  return data.map(([t, , , , c]) => ({
    time: Math.floor(t / 1000),
    value: parseFloat(c),
  }))
}

export function usePriceStream(timeframe: Timeframe) {
  const [isConnected, setIsConnected] = useState(false)
  const [initialData, setInitialData] = useState<ChartTick[]>([])
  const livePriceRef = useRef<number | null>(null)
  const listenersRef = useRef<Set<(tick: ChartTick) => void>>(new Set())

  const subscribeToTick = useCallback((callback: (tick: ChartTick) => void): (() => void) => {
    listenersRef.current.add(callback)
    return () => listenersRef.current.delete(callback)
  }, [])

  useEffect(() => {
    let cancelled = false

    async function init() {
      const data = await fetchInitialAreaData(REST_INTERVAL[timeframe])
      if (cancelled) return
      setInitialData(data)
      if (data.length) livePriceRef.current = data[data.length - 1].value
    }
    init()

    const ws = new WebSocket(WS_URL[timeframe])
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
      const time = Math.floor(Date.now() / 1000)
      const tick: ChartTick = { time, value }
      listenersRef.current.forEach((cb) => cb(tick))
    }

    return () => {
      cancelled = true
      ws.close()
    }
  }, [timeframe])

  return {
    initialData,
    subscribeToTick,
    livePriceRef,
    isConnected,
  }
}
