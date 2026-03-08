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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 font-mono"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-none border border-gray-800 bg-black p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-sm font-mono text-cyan-400 mb-3">[ DEPOSIT ]</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {QUICK_AMOUNTS.map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => onDeposit(amt)}
              className="px-3 py-2 rounded-none border border-gray-700 bg-black text-sm text-gray-400 hover:border-green-500 hover:text-green-500"
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
            className="flex-1 px-3 py-2 rounded-none border border-gray-800 bg-black text-gray-400 placeholder-gray-600 text-sm font-mono"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-none border border-green-500 text-green-500 text-sm font-mono hover:bg-green-500/10"
          >
            Add
          </button>
        </form>
        <button
          type="button"
          onClick={onClose}
          className="mt-3 w-full py-2 text-xs font-mono text-gray-500 hover:text-gray-400"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
