/**
 * Equity Curve: Balance over time. AreaSeries with crosshair and tooltip.
 */

import { createChart, CrosshairMode, IChartApi, ISeriesApi } from 'lightweight-charts'
import { useCallback, useEffect, useRef } from 'react'
import type { EquityPoint } from '../contexts/BotContext'

interface EquityChartProps {
  data: EquityPoint[]
  sessionStartingBalance: number
  height?: number
}

function formatTime(ts: number): string {
  const d = new Date(ts * 1000)
  return d.toTimeString().slice(0, 8)
}

export function EquityChart({
  data,
  sessionStartingBalance,
  height = 150,
}: EquityChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<'Area'> | null>(null)
  const tooltipRef = useRef<HTMLDivElement | null>(null)
  const prevLenRef = useRef(0)
  const userInspectingHistoryRef = useRef(false)
  const latestTimeRef = useRef<number | null>(null)

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
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          visible: true,
          labelVisible: true,
          labelBackgroundColor: 'rgba(0, 242, 255, 0.2)',
        },
        horzLine: {
          visible: true,
          labelVisible: true,
          labelBackgroundColor: 'rgba(0, 242, 255, 0.2)',
        },
      },
    })

    const areaSeries = chart.addAreaSeries({
      lineColor: '#00f2ff',
      topColor: 'rgba(0, 242, 255, 0.4)',
      bottomColor: 'rgba(0, 242, 255, 0)',
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 4,
      crosshairMarkerBorderColor: '#00f2ff',
      crosshairMarkerBorderWidth: 1,
    })

    const tooltip = document.createElement('div')
    tooltip.style.cssText = `
      position: absolute; display: none; padding: 6px 10px; z-index: 1000;
      pointer-events: none; font-family: ui-monospace, monospace; font-size: 11px;
      background: rgba(0,0,0,0.9); border: 1px solid rgba(0,242,255,0.4);
      color: #00f2ff; white-space: nowrap; border-radius: 2px;
    `
    containerRef.current.appendChild(tooltip)
    tooltipRef.current = tooltip

    chart.subscribeCrosshairMove((param) => {
      if (!tooltipRef.current || !seriesRef.current) return
      if (
        param.point === undefined ||
        !param.time ||
        param.point.x < 0 ||
        param.point.y < 0
      ) {
        tooltip.style.display = 'none'
        userInspectingHistoryRef.current = false
        return
      }

      const seriesData = param.seriesData.get(seriesRef.current) as
        | { value?: number; close?: number }
        | undefined
      const value = seriesData?.value ?? seriesData?.close
      if (value === undefined) {
        tooltip.style.display = 'none'
        return
      }

      const ts =
        typeof param.time === 'number'
          ? param.time
          : (param.time as { timestamp?: number })?.timestamp ?? 0
      const relPnl = sessionStartingBalance > 0
        ? ((value - sessionStartingBalance) / sessionStartingBalance) * 100
        : 0
      const pnlSign = relPnl >= 0 ? '+' : ''
      const pnlColor = relPnl >= 0 ? '#22c55e' : '#ef4444'

      tooltip.style.display = 'block'
      tooltip.innerHTML = `
        <div style="color: #9ca3af; margin-bottom: 2px;">${formatTime(ts)}</div>
        <div style="font-weight: 600; color: #00f2ff;">$${value.toFixed(2)}</div>
        <div style="color: ${pnlColor};">${pnlSign}${relPnl.toFixed(2)}%</div>
      `

      const margin = 8
      let left = param.point.x + margin
      let top = param.point.y + margin
      const rect = containerRef.current!.getBoundingClientRect()
      if (left + 100 > rect.width) left = param.point.x - 100 - margin
      if (top + 70 > rect.height) top = param.point.y - 70 - margin
      if (left < 0) left = margin
      if (top < 0) top = margin
      tooltip.style.left = `${left}px`
      tooltip.style.top = `${top}px`

      const latest = latestTimeRef.current
      userInspectingHistoryRef.current = latest != null && ts < latest
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
  }, [height, sessionStartingBalance])

  useEffect(() => {
    const cleanup = initChart()
    return () => {
      tooltipRef.current?.remove()
      tooltipRef.current = null
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
    const chart = chartRef.current
    if (!series || !chart || !data.length) return

    const last = data[data.length - 1]
    latestTimeRef.current = last.time

    if (data.length > prevLenRef.current && prevLenRef.current > 0) {
      series.update({ time: last.time, value: last.value } as any)
      if (!userInspectingHistoryRef.current) {
        chart.timeScale().fitContent()
      }
    } else if (data.length > 0) {
      series.setData(data as any)
      chart.timeScale().fitContent()
    }
    prevLenRef.current = data.length
  }, [data])

  return (
    <div className="relative border border-gray-800 rounded-none overflow-hidden bg-black">
      <div ref={containerRef} style={{ height }} />
    </div>
  )
}
