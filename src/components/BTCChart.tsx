/**
 * Polymarket-style dynamic area chart with gradient fill.
 * Uses AreaSeries instead of candlesticks; subscribes to price stream via refs
 * to avoid re-renders on every tick.
 */

import { createChart, IChartApi, IPriceLine, ISeriesApi } from 'lightweight-charts'
import { useCallback, useEffect, useRef } from 'react'
import type { ChartTick } from '../hooks/usePriceStream'

interface BTCChartProps {
  initialData: ChartTick[]
  subscribeToTick: (cb: (tick: ChartTick) => void) => () => void
  mark: number | null
  height?: number
}

export function BTCChart({
  initialData,
  subscribeToTick,
  mark,
  height = 220,
}: BTCChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const areaSeriesRef = useRef<ISeriesApi<'Area'> | null>(null)
  const markLineRef = useRef<IPriceLine | null>(null)

  const initChart = useCallback(() => {
    if (!containerRef.current || containerRef.current.children.length) return

    const chart = createChart(containerRef.current, {
      layout: {
        background: { color: '#0f0f0f' },
        textColor: '#9ca3af',
      },
      grid: {
        vertLines: { color: '#1f2937' },
        horzLines: { color: '#1f2937' },
      },
      width: containerRef.current.clientWidth,
      height,
      rightPriceScale: {
        borderColor: '#374151',
        scaleMargins: { top: 0.1, bottom: 0.2 },
      },
      timeScale: {
        borderColor: '#374151',
        timeVisible: true,
        secondsVisible: true,
      },
      crosshair: {
        vertLine: { color: '#4b5563' },
        horzLine: { color: '#4b5563' },
      },
    })

    const areaSeries = chart.addAreaSeries({
      lineColor: '#22c55e',
      topColor: 'rgba(34, 197, 94, 0.4)',
      bottomColor: 'rgba(34, 197, 94, 0)',
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: true,
    })

    chartRef.current = chart
    areaSeriesRef.current = areaSeries

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
        areaSeriesRef.current = null
        markLineRef.current = null
      }
      cleanup?.()
    }
  }, [initChart])

  // Set initial data (lightweight-charts uses UTCTimestamp = number)
  useEffect(() => {
    if (!areaSeriesRef.current || !initialData.length) return
    areaSeriesRef.current.setData(initialData as any)
  }, [initialData])

  // Subscribe to live ticks (no state = no re-renders)
  useEffect(() => {
    const unsub = subscribeToTick((tick) => {
      areaSeriesRef.current?.update(tick as any)
    })
    return unsub
  }, [subscribeToTick])

  // Update Mark price line
  useEffect(() => {
    const series = areaSeriesRef.current
    if (!series) return

    if (mark != null && mark > 0) {
      if (markLineRef.current) {
        markLineRef.current.applyOptions({ price: mark })
      } else {
        markLineRef.current = series.createPriceLine({
          price: mark,
          color: '#f59e0b',
          lineWidth: 2,
          lineStyle: 2, // dashed
          axisLabelVisible: true,
          title: 'Mark',
        })
      }
    } else if (markLineRef.current) {
      series.removePriceLine(markLineRef.current)
      markLineRef.current = null
    }
  }, [mark])

  return (
    <div className="relative rounded-xl overflow-hidden bg-[#0f0f0f] border border-gray-800">
      <div ref={containerRef} style={{ height }} />
    </div>
  )
}
