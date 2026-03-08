import { useState } from 'react'

interface DepositModalProps {
  onClose: () => void
  onDeposit: (amount: number) => void
}

const QUICK_AMOUNTS = [50, 100, 250, 500]

export function DepositModal({ onClose, onDeposit }: DepositModalProps) {
  const [input, setInput] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseFloat(input)
    if (!Number.isNaN(amount) && amount > 0) {
      onDeposit(amount)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-xl border border-gray-800 bg-[#141414] p-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-sm font-semibold text-white mb-3">Deposit</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {QUICK_AMOUNTS.map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => onDeposit(amt)}
              className="px-3 py-2 rounded-lg bg-gray-800 text-sm text-white hover:bg-gray-700"
            >
              ${amt}
            </button>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="number"
            min={1}
            step={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Custom amount"
            className="flex-1 px-3 py-2 rounded-lg bg-[#1a1a1a] border border-gray-700 text-white placeholder-gray-500 text-sm"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium"
          >
            Add
          </button>
        </form>
        <button
          type="button"
          onClick={onClose}
          className="mt-3 w-full py-2 text-xs text-gray-500 hover:text-gray-400"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
