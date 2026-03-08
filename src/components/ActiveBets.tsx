import { ChevronUp, ChevronDown, Clock, X } from 'lucide-react'
import { useApp } from '../contexts/AppContext'

interface ActiveBetsProps {
  secondsLeft: number
}

export function ActiveBets({ secondsLeft }: ActiveBetsProps) {
  const { activeBets, pendingBets, cancelPendingBet } = useApp()

  if (!activeBets.length && !pendingBets.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <Clock className="w-12 h-12 mb-3 opacity-50" />
        <p className="font-medium">No active predictions</p>
        <p className="text-sm mt-1">Place a bet on the Trade tab</p>
      </div>
    )
  }

  const countdownStr = `${String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:${String(secondsLeft % 60).padStart(2, '0')}`

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500">
        Round ends in {countdownStr}
      </p>
      {activeBets.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-400">Active (this round)</p>
          {activeBets.map((bet) => (
            <div
              key={bet.id}
              className={`flex items-center justify-between p-3 rounded-xl border ${
                bet.type === 'yes'
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-red-500/10 border-red-500/30'
              }`}
            >
              <div className="flex items-center gap-2">
                {bet.type === 'yes' ? (
                  <ChevronUp className="w-5 h-5 text-emerald-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-red-400" />
                )}
                <div>
                  <p className="font-semibold text-sm">
                    {bet.type === 'yes' ? 'Yes' : 'No'} @ Mark ${bet.mark.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">${bet.amount.toFixed(2)} · x1.9 payout</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-amber-500 font-mono">Resolving</p>
              </div>
            </div>
          ))}
        </div>
      )}
      {pendingBets.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-400">Next round (cancelable)</p>
          {pendingBets.map((bet) => (
            <div
              key={bet.id}
              className={`flex items-center justify-between p-3 rounded-xl border opacity-75 ${
                bet.type === 'yes'
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-red-500/10 border-red-500/30'
              }`}
            >
              <div className="flex items-center gap-2">
                {bet.type === 'yes' ? (
                  <ChevronUp className="w-5 h-5 text-emerald-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-red-400" />
                )}
                <div>
                  <p className="font-semibold text-sm">
                    {bet.type === 'yes' ? 'Yes' : 'No'}
                  </p>
                  <p className="text-xs text-gray-500">${bet.amount.toFixed(2)} · Next round</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => cancelPendingBet(bet.id)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700/50 transition-colors"
                aria-label="Cancel bet"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
