import { ChevronUp, ChevronDown, Clock } from 'lucide-react'
import { useApp } from '../contexts/AppContext'
import { useCandleCountdown } from '../hooks/useCandleCountdown'

export function ActiveBets() {
  const { activeBets } = useApp()
  const { secondsLeft } = useCandleCountdown()

  if (!activeBets.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <Clock className="w-12 h-12 mb-3 opacity-50" />
        <p className="font-medium">No active predictions</p>
        <p className="text-sm mt-1">Place a bet on the Trade tab</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500">
        Resolves in {String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:
        {String(secondsLeft % 60).padStart(2, '0')}
      </p>
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
                {bet.type === 'yes' ? 'Yes' : 'No'} @ ${bet.entryPrice.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">${bet.amount.toFixed(2)} · x1.9 payout</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-amber-500 font-mono">Pending</p>
          </div>
        </div>
      ))}
    </div>
  )
}
