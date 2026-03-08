import { Wallet } from 'lucide-react'
import { useTelegram } from '../contexts/TelegramContext'

interface HeaderProps {
  balance: number
  onDeposit: () => void
}

export function Header({ balance, onDeposit }: HeaderProps) {
  const { user, debugLabel } = useTelegram()

  const displayName =
    [user?.first_name, user?.last_name].filter(Boolean).join(' ') ||
    user?.username ||
    'Player'

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-black border-b border-gray-800">
      <div className="flex items-center gap-2">
        {user?.photo_url ? (
          <img
            src={user.photo_url}
            alt=""
            className="w-9 h-9 rounded-none object-cover border border-gray-800"
          />
        ) : (
          <div className="w-9 h-9 rounded-none bg-gray-900 flex items-center justify-center border border-gray-800">
            <span className="text-sm font-mono text-gray-400">
              {user?.first_name?.[0] || user?.username?.[0] || '?'}
            </span>
          </div>
        )}
        <div>
          <p className="text-xs font-mono text-gray-500">{displayName}</p>
          <p className="text-[10px] font-mono text-yellow-500/80" title="Debug: Telegram user context">
            {debugLabel}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <p className="text-sm font-mono tabular-nums text-green-500">
          ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <button
          type="button"
          onClick={onDeposit}
          className="flex items-center gap-1 px-3 py-1.5 rounded-none border border-gray-700 bg-black text-cyan-400 text-xs font-mono hover:bg-gray-900 active:scale-95 transition-colors"
        >
          <Wallet className="w-3.5 h-3.5" />
          Deposit
        </button>
      </div>
    </header>
  )
}
