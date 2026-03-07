import { ChevronUp, ChevronDown, Percent, Wallet } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useApp } from '../contexts/AppContext'

interface BettingCardProps {
  mark: number | null
  secondsLeft: number
  isConnected: boolean
}

export function BettingCard({ mark, secondsLeft, isConnected }: BettingCardProps) {
  const { balance, placePendingBet } = useApp()
  const [amount, setAmount] = useState('')

  const betAmount = parseFloat(amount) || 0
  const canBet = isConnected && betAmount > 0 && betAmount <= balance

  const countdownStr = `${String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:${String(secondsLeft % 60).padStart(2, '0')}`

  const handleYes = useCallback(() => {
    if (!canBet || mark == null) return
    const ok = placePendingBet({
      type: 'yes',
      amount: betAmount,
      mark,
      placedAt: Date.now(),
    })
    if (ok) setAmount('')
  }, [canBet, betAmount, mark, placePendingBet])

  const handleNo = useCallback(() => {
    if (!canBet || mark == null) return
    const ok = placePendingBet({
      type: 'no',
      amount: betAmount,
      mark,
      placedAt: Date.now(),
    })
    if (ok) setAmount('')
  }, [canBet, betAmount, mark, placePendingBet])

  return (
    <div className="rounded-xl border border-gray-800 bg-[#141414] p-4 space-y-3">
      <p className="text-sm font-medium text-gray-400">
        Will BTC close <span className="text-white font-semibold">higher</span> than the Mark in the next round?
      </p>
      <p className="text-xs text-amber-500 font-medium">
        Predict Next Round · Starts in {countdownStr}
      </p>

      <div className="relative">
        <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="number"
          min={0}
          max={balance}
          step={1}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount ($)"
          className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#1a1a1a] border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
          <button
            type="button"
            onClick={() => setAmount(String(Math.floor(balance / 2)))}
            className="px-2 py-1 text-xs text-gray-400 hover:text-white hover:bg-gray-700 rounded"
          >
            Half
          </button>
          <button
            type="button"
            onClick={() => setAmount(String(balance))}
            className="px-2 py-1 text-xs text-emerald-400 hover:text-emerald-300 hover:bg-gray-700 rounded"
          >
            Max
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={!canBet}
          onClick={handleYes}
          className="flex flex-col items-center justify-center gap-1 py-4 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-transform"
        >
          <ChevronUp className="w-6 h-6" />
          <span className="font-bold">Yes / Up</span>
          <span className="text-xs text-gray-400 flex items-center gap-0.5">
            <Percent className="w-3 h-3" /> Payout x1.9
          </span>
        </button>
        <button
          type="button"
          disabled={!canBet}
          onClick={handleNo}
          className="flex flex-col items-center justify-center gap-1 py-4 rounded-xl bg-red-500/20 border border-red-500/50 text-red-400 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-transform"
        >
          <ChevronDown className="w-6 h-6" />
          <span className="font-bold">No / Down</span>
          <span className="text-xs text-gray-400 flex items-center gap-0.5">
            <Percent className="w-3 h-3" /> Payout x1.9
          </span>
        </button>
      </div>
    </div>
  )
}
