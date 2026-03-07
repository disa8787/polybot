import { Trophy, XCircle } from 'lucide-react'
import { useApp } from '../contexts/AppContext'

export function History() {
  const { history } = useApp()

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
                {bet.type === 'yes' ? 'Yes' : 'No'} @ ${bet.entryPrice.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">
                Closed: ${bet.closePrice.toLocaleString()} · {bet.won ? '+' : '-'}${Math.abs(bet.payout - (bet.won ? bet.amount : 0)).toFixed(2)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className={`font-bold ${bet.won ? 'text-emerald-400' : 'text-red-400'}`}>
              {bet.won ? '+' : ''}${(bet.payout - (bet.won ? bet.amount : 0)).toFixed(2)}
            </p>
            <p className="text-xs text-gray-500">{bet.won ? 'Win' : 'Loss'}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
