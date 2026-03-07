import { useCallback, useEffect, useRef, useState } from 'react'
import type { Candlestick } from '../types'

const BINANCE_WS = 'wss://stream.binance.com:9443/ws/btcusdt@kline_5m'

/** Binance kline message shape */
interface KlineMsg {
  k: {
    t: number  // open time
    o: string  // open
    h: string
    l: string
    c: string  // close
    x: boolean // is closed
  }
}

/** Callback when a 5m candle closes (from Binance stream) */
export type OnCandleClose = (closePrice: number, closeTimeMs: number) => void

/** Fetch initial historical 5m candles from Binance REST API */
async function fetchInitialCandles(): Promise<Candlestick[]> {
  const res = await fetch(
    'https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=5m&limit=100'
  )
  const data = (await res.json()) as [number, string, string, string, string, number][]
  return data.map(([t, o, h, l, c]) => ({
    time: Math.floor(t / 1000) as number,
    open: parseFloat(o),
    high: parseFloat(h),
    low: parseFloat(l),
    close: parseFloat(c),
  }))
}

export function useBinanceWebSocket(onCandleClose?: OnCandleClose) {
  const [candles, setCandles] = useState<Candlestick[]>([])
  const [livePrice, setLivePrice] = useState<number | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const candlesRef = useRef<Candlestick[]>([])
  const onCandleCloseRef = useRef(onCandleClose)
  onCandleCloseRef.current = onCandleClose

  const appendOrUpdateCandle = useCallback((c: Candlestick) => {
    setCandles((prev) => {
      const idx = prev.findIndex((x) => x.time === c.time)
      let next: Candlestick[]
      if (idx >= 0) {
        next = [...prev]
        next[idx] = c
      } else {
        next = [...prev, c].sort((a, b) => a.time - b.time)
      }
      candlesRef.current = next
      return next
    })
  }, [])

  useEffect(() => {
    let cancelled = false

    async function init() {
      const initial = await fetchInitialCandles()
      if (cancelled) return
      setCandles(initial)
      candlesRef.current = initial
      if (initial.length) setLivePrice(initial[initial.length - 1].close)
    }
    init()

    const ws = new WebSocket(BINANCE_WS)
    wsRef.current = ws

    ws.onopen = () => {
      if (!cancelled) setIsConnected(true)
    }
    ws.onclose = () => {
      if (!cancelled) setIsConnected(false)
    }
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data) as KlineMsg
      const k = msg.k
      const c: Candlestick = {
        time: Math.floor(k.t / 1000),
        open: parseFloat(k.o),
        high: parseFloat(k.h),
        low: parseFloat(k.l),
        close: parseFloat(k.c),
      }
      appendOrUpdateCandle(c)
      setLivePrice(c.close)
      if (k.x) {
        const closeTimeMs = k.t + 5 * 60 * 1000
        onCandleCloseRef.current?.(c.close, closeTimeMs)
      }
    }

    return () => {
      cancelled = true
      ws.close()
      wsRef.current = null
    }
  }, [appendOrUpdateCandle])

  return { candles, livePrice, isConnected }
}
