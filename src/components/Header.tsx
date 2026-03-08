import { Wallet } from 'lucide-react'
import WebApp from '@twa-dev/sdk'

interface HeaderProps {
  balance: number
  onDeposit: () => void
}

export function Header({ balance, onDeposit }: HeaderProps) {
  const user = WebApp.initDataUnsafe?.user

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-[#0f0f0f] border-b border-gray-800">
      <div className="flex items-center gap-2">
        {user?.photo_url ? (
          <img
            src={user.photo_url}
            alt=""
            className="w-9 h-9 rounded-full object-cover border border-gray-700"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center">
            <span className="text-sm font-semibold text-gray-300">
              {user?.first_name?.[0] || '?'}
            </span>
          </div>
        )}
        <p className="text-xs text-gray-400">
          {user?.first_name || user?.username || 'Player'}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <p className="text-sm font-bold font-mono tabular-nums text-emerald-400">
          ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <button
          type="button"
          onClick={onDeposit}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium active:scale-95 transition-transform"
        >
          <Wallet className="w-3.5 h-3.5" />
          Deposit
        </button>
      </div>
    </header>
  )
}
