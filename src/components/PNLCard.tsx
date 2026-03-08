/**
 * Shareable PNL Card — premium dark design with dynamic gradient.
 * Uses inline styles where needed for html2canvas capture reliability.
 */

import type { PNLStats } from '../lib/pnlStats'
import type { ResolvedBet } from '../types'

interface PNLCardProps {
  stats: PNLStats
  highlightedTrade?: ResolvedBet | null
}

export function PNLCard({ stats, highlightedTrade }: PNLCardProps) {
  const isPositive = stats.netPnL >= 0
  const gradientBg = isPositive
    ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(0,0,0,0.9) 50%, rgba(0,0,0,1) 100%)'
    : 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(0,0,0,0.9) 50%, rgba(0,0,0,1) 100%)'

  const glowColor = isPositive ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)'
  const accentColor = isPositive ? '#22c55e' : '#ef4444'

  return (
    <div
      className="rounded-2xl overflow-hidden border"
      style={{
        width: 320,
        minHeight: 400,
        background: gradientBg,
        borderColor: isPositive ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)',
        boxShadow: `0 0 60px ${glowColor}`,
      }}
    >
      {/* Header with branding */}
      <div className="px-6 pt-6 pb-2">
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ color: '#ffffff', fontFamily: 'system-ui, sans-serif' }}
        >
          PolyBot
        </h1>
        <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>
          Trading Performance
        </p>
      </div>

      {/* Optional highlighted trade */}
      {highlightedTrade != null && (
        <div
          className="mx-6 mt-2 mb-4 p-4 rounded-xl text-center"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: `1px solid ${highlightedTrade.won ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          }}
        >
          <p className="text-xs mb-1" style={{ color: '#9ca3af' }}>
            This Trade
          </p>
          <p
            className="text-2xl font-bold tabular-nums"
            style={{
              color: highlightedTrade.won ? '#22c55e' : '#ef4444',
              fontFamily: 'monospace',
            }}
          >
            {highlightedTrade.won ? '+' : ''}
            ${(highlightedTrade.payout - (highlightedTrade.won ? highlightedTrade.amount : 0)).toFixed(2)}
          </p>
        </div>
      )}

      {/* Global stats */}
      <div className="px-6 pb-6 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <StatBlock
            label="Total Bets"
            value={String(stats.totalBets)}
          />
          <StatBlock
            label="Win Rate"
            value={`${stats.winRate.toFixed(1)}%`}
          />
        </div>

        <div
          className="p-4 rounded-xl text-center"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: `1px solid ${isPositive ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
          }}
        >
          <p className="text-xs mb-1" style={{ color: '#9ca3af' }}>
            Total Net P/L
          </p>
          <p
            className="text-2xl font-bold tabular-nums"
            style={{ color: accentColor, fontFamily: 'monospace' }}
          >
            {stats.netPnL >= 0 ? '+' : ''}${stats.netPnL.toFixed(2)}
          </p>
          {stats.totalWagered > 0 && (
            <p
              className="text-sm mt-0.5 tabular-nums"
              style={{ color: accentColor, opacity: 0.9 }}
            >
              {stats.netPnL >= 0 ? '+' : ''}{stats.pnlPercent.toFixed(1)}%
            </p>
          )}
        </div>

        {/* Footer branding */}
        <p className="text-center text-xs pt-2" style={{ color: '#4b5563' }}>
          PolyBot · BTC Prediction
        </p>
      </div>
    </div>
  )
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="p-3 rounded-lg"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <p className="text-xs mb-0.5" style={{ color: '#6b7280' }}>
        {label}
      </p>
      <p className="text-lg font-semibold tabular-nums" style={{ color: '#ffffff' }}>
        {value}
      </p>
    </div>
  )
}
