/**
 * Equity Curve: Balance over time. AreaSeries, no axes/grid.
 */

import { createChart, IChartApi, ISeriesApi } from 'lightweight-charts'
import { useCallback, useEffect, useRef } from 'react'
import type { EquityPoint } from '../contexts/BotContext'

interface EquityChartProps {
  data: EquityPoint[]
  height?: number
}

export function EquityChart({ data, height = 150 }: EquityChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<'Area'> | null>(null)
  const prevLenRef = useRef(0)

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

    const areaSeries = chart.addAreaSeries({
      lineColor: '#22d3ee',
      topColor: 'rgba(34, 211, 238, 0.3)',
      bottomColor: 'rgba(34, 211, 238, 0)',
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: false,
    })

    chartRef.current = chart
    seriesRef.current = areaSeries

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
        seriesRef.current = null
      }
      cleanup?.()
    }
  }, [initChart])

  useEffect(() => {
    const series = seriesRef.current
    if (!series || !data.length) return
    if (data.length > prevLenRef.current && prevLenRef.current > 0) {
      const last = data[data.length - 1]
      series.update({ time: last.time, value: last.value } as any)
    } else if (data.length > 0) {
      series.setData(data as any)
    }
    prevLenRef.current = data.length
  }, [data])

  return (
    <div className="border border-gray-800 rounded-none overflow-hidden bg-black">
      <div ref={containerRef} style={{ height }} />
    </div>
  )
}
