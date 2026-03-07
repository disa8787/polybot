import { DollarSign, TrendingUp } from 'lucide-react'
import WebApp from '@twa-dev/sdk'

export function Header({ balance }: { balance: number }) {
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
        <div>
          <p className="text-xs text-gray-400">
            {user?.first_name || user?.username || 'Player'}
          </p>
          <p className="flex items-center gap-1 text-sm font-bold text-emerald-400">
            <DollarSign className="w-4 h-4" />
            {balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-xs text-gray-400 flex items-center justify-end gap-1">
          <TrendingUp className="w-3 h-3" />
          Virtual Balance
        </p>
        <p className="text-xs text-gray-500">No real money</p>
      </div>
    </header>
  )
}
