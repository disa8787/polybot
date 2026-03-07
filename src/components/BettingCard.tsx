import { ChevronUp, ChevronDown, Percent, Wallet } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useApp } from '../contexts/AppContext'
import { useCandleCountdown } from '../hooks/useCandleCountdown'

interface BettingCardProps {
  entryPrice: number
  isConnected: boolean
}

export function BettingCard({ entryPrice, isConnected }: BettingCardProps) {
  const { balance, placeBet } = useApp()
  const { secondsLeft, closeTime } = useCandleCountdown()
  const [amount, setAmount] = useState('')

  const betAmount = parseFloat(amount) || 0
  const canBet = isConnected && betAmount > 0 && betAmount <= balance && secondsLeft > 10

  const handleYes = useCallback(() => {
    if (!canBet) return
    const ok = placeBet({
      type: 'yes',
      amount: betAmount,
      entryPrice,
      candleCloseTime: closeTime,
      placedAt: Date.now(),
    })
    if (ok) setAmount('')
  }, [canBet, betAmount, entryPrice, closeTime, placeBet])

  const handleNo = useCallback(() => {
    if (!canBet) return
    const ok = placeBet({
      type: 'no',
      amount: betAmount,
      entryPrice,
      candleCloseTime: closeTime,
      placedAt: Date.now(),
    })
    if (ok) setAmount('')
  }, [canBet, betAmount, entryPrice, closeTime, placeBet])

  return (
    <div className="rounded-xl border border-gray-800 bg-[#141414] p-4 space-y-3">
      <p className="text-sm font-medium text-gray-400">
        Will BTC close <span className="text-white font-semibold">higher</span> than current price in 5 minutes?
      </p>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Closes in</span>
        <span className="font-mono font-semibold text-amber-500">
          {String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:{String(secondsLeft % 60).padStart(2, '0')}
        </span>
      </div>

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
