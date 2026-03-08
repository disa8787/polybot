import { Trophy, XCircle, Share2 } from 'lucide-react'
import { useState } from 'react'
import { useApp } from '../contexts/AppContext'
import { computePNLStats } from '../lib/pnlStats'
import { PNLModal } from './PNLModal'
import type { ResolvedBet } from '../types'

export function History() {
  const { history, totalDeposited } = useApp()
  const [showPNLModal, setShowPNLModal] = useState(false)
  const [highlightedTrade, setHighlightedTrade] = useState<ResolvedBet | null>(null)

  const stats = computePNLStats(history, totalDeposited)

  const openOverallPNL = () => {
    setHighlightedTrade(null)
    setShowPNLModal(true)
  }

  const openTradePNL = (bet: ResolvedBet) => {
    setHighlightedTrade(bet)
    setShowPNLModal(true)
  }

  if (!history.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <Trophy className="w-12 h-12 mb-3 opacity-50" />
        <p className="font-medium">No history yet</p>
        <p className="text-sm mt-1">Resolved bets will appear here</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={openOverallPNL}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-gray-700 bg-[#141414] text-emerald-400 hover:bg-[#1a1a1a] transition-colors"
      >
        <Share2 className="w-4 h-4" />
        <span className="font-medium">Share PNL</span>
      </button>

      {showPNLModal && (
        <PNLModal
          stats={stats}
          highlightedTrade={highlightedTrade}
          onClose={() => setShowPNLModal(false)}
        />
      )}

      {history.map((bet) => (
        <div
          key={bet.id}
          className={`flex items-center justify-between p-3 rounded-xl border ${
            bet.won
              ? 'bg-emerald-500/10 border-emerald-500/30'
              : 'bg-red-500/10 border-red-500/30'
          }`}
        >
          <div className="flex items-center gap-2">
            {bet.won ? (
              <Trophy className="w-5 h-5 text-emerald-400" />
            ) : (
              <XCircle className="w-5 h-5 text-red-400" />
            )}
            <div>
              <p className="font-semibold text-sm">
                {bet.type === 'yes' ? 'Yes' : 'No'} @ Mark ${bet.mark.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">
                Closed: ${bet.closePrice.toLocaleString()} · {bet.won ? '+' : '-'}${Math.abs(bet.payout - (bet.won ? bet.amount : 0)).toFixed(2)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => openTradePNL(bet)}
              className="p-1.5 rounded-lg text-gray-500 hover:text-emerald-400 hover:bg-gray-700/50"
              aria-label="Share this trade"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <div className="text-right">
              <p className={`font-bold ${bet.won ? 'text-emerald-400' : 'text-red-400'}`}>
                {bet.won ? '+' : ''}${(bet.payout - (bet.won ? bet.amount : 0)).toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">{bet.won ? 'Win' : 'Loss'}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
