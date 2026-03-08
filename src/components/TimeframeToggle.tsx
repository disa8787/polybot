import type { Timeframe } from '../hooks/usePriceStream'

interface TimeframeToggleProps {
  value: Timeframe
  onChange: (v: Timeframe) => void
}

export function TimeframeToggle({ value, onChange }: TimeframeToggleProps) {
  return (
    <div className="inline-flex rounded-lg bg-[#1a1a1a] p-0.5 border border-gray-800">
      {(['1m', '5m'] as const).map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            value === opt
              ? 'bg-emerald-600 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}
