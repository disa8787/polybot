import { useCallback, useState } from 'react'
import { BarChart3, Clock, History } from 'lucide-react'
import { Header } from './components/Header'
import { BTCChart } from './components/BTCChart'
import { BettingCard } from './components/BettingCard'
import { ActiveBets } from './components/ActiveBets'
import { History as HistoryTab } from './components/History'
import { LivePriceDisplay } from './components/LivePriceDisplay'
import { ActivityFeed } from './components/ActivityFeed'
import { useApp } from './contexts/AppContext'
import { usePriceStream } from './hooks/usePriceStream'
import { useRoundLogic } from './hooks/useRoundLogic'
import { useActivityFeed } from './hooks/useActivityFeed'

type Tab = 'trade' | 'active' | 'history'

function App() {
  const { onRoundEnd, activeBets, pendingBets } = useApp()
  const { items: activityItems, triggerActivityBatch } = useActivityFeed()
  const [tab, setTab] = useState<Tab>('trade')

  const handleRoundEnd = useCallback(
    (closePrice: number, newMark: number) => {
      onRoundEnd(closePrice, newMark)
      triggerActivityBatch()
    },
    [onRoundEnd, triggerActivityBatch]
  )

  const {
    initialData,
    subscribeToTick,
    livePriceRef,
    isConnected,
  } = usePriceStream()

  const { secondsLeft, mark } = useRoundLogic(livePriceRef, handleRoundEnd, isConnected)

  const totalBets = activeBets.length + pendingBets.length

  return (
    <div className="min-h-dvh flex flex-col bg-[#0f0f0f]">
      <HeaderWithBalance />
      {/* Current price banner */}
      <div className="px-4 py-2 flex items-center justify-between bg-[#141414] border-b border-gray-800">
        <span className="text-sm text-gray-400">BTC/USD</span>
        <LivePriceDisplay livePriceRef={livePriceRef} className="text-lg font-bold font-mono tabular-nums text-white" />
        {!isConnected && (
          <span className="text-xs text-amber-500">Reconnecting...</span>
        )}
      </div>

      {tab === 'trade' && (
        <div className="flex-1 overflow-auto px-4 py-3 space-y-4">
          <BTCChart
            initialData={initialData}
            subscribeToTick={subscribeToTick}
            mark={mark}
            height={220}
          />
          <BettingCard
            mark={mark}
            secondsLeft={secondsLeft}
            isConnected={isConnected}
          />
          <ActivityFeed items={activityItems} />
        </div>
      )}
      {tab === 'active' && (
        <div className="flex-1 overflow-auto px-4 py-3">
          <ActiveBets secondsLeft={secondsLeft} />
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
          badge={totalBets > 0 ? totalBets : undefined}
        />
        <TabButton
          active={tab === 'active'}
          onClick={() => setTab('active')}
          icon={Clock}
          label="Active"
          badge={totalBets > 0 ? totalBets : undefined}
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

function HeaderWithBalance() {
  const { balance } = useApp()
  return <Header balance={balance} />
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
