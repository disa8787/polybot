import { useCallback, useState } from 'react'
import { BarChart3, Clock, History } from 'lucide-react'
import { Header } from './components/Header'
import { BTCChart } from './components/BTCChart'
import { BettingCard } from './components/BettingCard'
import { ActiveBets } from './components/ActiveBets'
import { History as HistoryTab } from './components/History'
import { useApp } from './contexts/AppContext'
import { useBinanceWebSocket } from './hooks/useBinanceWebSocket'

type Tab = 'trade' | 'active' | 'history'

function App() {
  const { balance, activeBets, resolveBet } = useApp()
  const [tab, setTab] = useState<Tab>('trade')

  const onCandleClose = useCallback(
    (closePrice: number, closeTimeMs: number) => {
      activeBets.forEach((bet) => {
        if (Math.abs(bet.candleCloseTime - closeTimeMs) < 60_000) {
          resolveBet(bet, closePrice)
        }
      })
    },
    [activeBets, resolveBet]
  )

  const { candles, livePrice, isConnected } = useBinanceWebSocket(onCandleClose)
  const entryPrice = livePrice ?? (candles[candles.length - 1]?.close ?? 0)

  return (
    <div className="min-h-dvh flex flex-col bg-[#0f0f0f]">
      <Header balance={balance} />

      {/* Current price banner */}
      <div className="px-4 py-2 flex items-center justify-between bg-[#141414] border-b border-gray-800">
        <span className="text-sm text-gray-400">BTC/USD</span>
        <span
          className={`text-lg font-bold font-mono tabular-nums ${
            livePrice ? 'text-white' : 'text-gray-500'
          }`}
        >
          {livePrice != null
            ? `$${livePrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
            : 'Loading...'}
        </span>
        {!isConnected && (
          <span className="text-xs text-amber-500">Reconnecting...</span>
        )}
      </div>

      {tab === 'trade' && (
        <div className="flex-1 overflow-auto px-4 py-3 space-y-4">
          <BTCChart candles={candles} livePrice={livePrice} height={220} />
          <BettingCard entryPrice={entryPrice} isConnected={isConnected} />
        </div>
      )}
      {tab === 'active' && (
        <div className="flex-1 overflow-auto px-4 py-3">
          <ActiveBets />
        </div>
      )}
      {tab === 'history' && (
        <div className="flex-1 overflow-auto px-4 py-3">
          <HistoryTab />
        </div>
      )}

      {/* Bottom tabs */}
      <nav className="flex border-t border-gray-800 bg-[#0f0f0f] safe-area-pb">
        <TabButton
          active={tab === 'trade'}
          onClick={() => setTab('trade')}
          icon={BarChart3}
          label="Trade"
          badge={activeBets.length > 0 ? activeBets.length : undefined}
        />
        <TabButton
          active={tab === 'active'}
          onClick={() => setTab('active')}
          icon={Clock}
          label="Active"
          badge={activeBets.length > 0 ? activeBets.length : undefined}
        />
        <TabButton
          active={tab === 'history'}
          onClick={() => setTab('history')}
          icon={History}
          label="History"
        />
      </nav>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
  badge,
}: {
  active: boolean
  onClick: () => void
  icon: React.ComponentType<{ className?: string }>
  label: string
  badge?: number
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-colors relative ${
        active ? 'text-emerald-400' : 'text-gray-500'
      }`}
    >
      <span className="relative">
        <Icon className="w-5 h-5" />
        {badge != null && badge > 0 && (
          <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-emerald-500 text-white text-xs font-bold">
            {badge}
          </span>
        )}
      </span>
      <span className="text-xs font-medium">{label}</span>
    </button>
  )
}

export { App }
