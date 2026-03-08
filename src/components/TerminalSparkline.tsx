/**
 * Minimalist terminal-style sparkline. No axes, grid, or watermarks.
 */

import { createChart, IChartApi, ISeriesApi } from 'lightweight-charts'
import { useCallback, useEffect, useRef } from 'react'
import type { ChartTick } from '../hooks/usePriceStream'

interface TerminalSparklineProps {
  initialData: ChartTick[]
  subscribeToTick: (cb: (tick: ChartTick) => void) => () => void
  height?: number
}

export function TerminalSparkline({
  initialData,
  subscribeToTick,
  height = 150,
}: TerminalSparklineProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const lineSeriesRef = useRef<ISeriesApi<'Line'> | null>(null)

  const initChart = useCallback(() => {
    if (!containerRef.current || containerRef.current.children.length) return

    const chart = createChart(containerRef.current, {
      layout: {
        background: { color: 'transparent' },
        textColor: 'transparent',
        attributionLogo: false,
      },
      watermark: { visible: false },
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false },
      },
      width: containerRef.current.clientWidth,
      height,
      rightPriceScale: { visible: false },
      leftPriceScale: { visible: false },
      timeScale: { visible: false },
      crosshair: { vertLine: { visible: false }, horzLine: { visible: false } },
    })

    const lineSeries = chart.addLineSeries({
      color: '#00d4aa',
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: false,
    })

    chartRef.current = chart
    lineSeriesRef.current = lineSeries

    const handleResize = () => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: containerRef.current.clientWidth })
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [height])

  useEffect(() => {
    const cleanup = initChart()
    return () => {
      if (chartRef.current) {
        chartRef.current.remove()
        chartRef.current = null
        lineSeriesRef.current = null
      }
      cleanup?.()
    }
  }, [initChart])

  useEffect(() => {
    if (!lineSeriesRef.current || !initialData.length) return
    lineSeriesRef.current.setData(initialData as any)
  }, [initialData])

  useEffect(() => {
    const unsub = subscribeToTick((tick) => {
      lineSeriesRef.current?.update(tick as any)
    })
    return unsub
  }, [subscribeToTick])

  return (
    <div className="border border-gray-800 rounded-none overflow-hidden bg-black">
      <div ref={containerRef} style={{ height }} />
    </div>
  )
}
