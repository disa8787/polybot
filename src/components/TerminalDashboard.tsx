import { useEffect, useState } from 'react'
import { useApp } from '../contexts/AppContext'
import { useBot } from '../contexts/BotContext'
import { usePriceStream } from '../hooks/usePriceStream'
import { LivePriceDisplay } from './LivePriceDisplay'
import { LiveFeed } from './LiveFeed'
import { TerminalSparkline } from './TerminalSparkline'
import { DepositModal } from './DepositModal'
import { Header } from './Header'

export function TerminalDashboard() {
  const { balance, deposit } = useApp()
  const {
    isRunning,
    consoleLogs,
    sessionTotalProfit,
    sessionOrders,
    sessionWins,
    startBot,
    stopBot,
  } = useBot()
  const [showDeposit, setShowDeposit] = useState(false)
  const [uptime, setUptime] = useState('00:00:00')
  const startTimeRef = useState(() => Date.now())[0]

  const { initialData, subscribeToTick, livePriceRef } = usePriceStream('5m')

  useEffect(() => {
    const id = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef) / 1000)
      const h = Math.floor(elapsed / 3600)
      const m = Math.floor((elapsed % 3600) / 60)
      const s = elapsed % 60
      setUptime(
        `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      )
    }, 1000)
    return () => clearInterval(id)
  }, [startTimeRef])

  const winRate = sessionOrders > 0 ? (sessionWins / sessionOrders) * 100 : 0

  return (
    <div className="min-h-dvh flex flex-col bg-black text-gray-500">
      <Header balance={balance} onDeposit={() => setShowDeposit(true)} />
      {showDeposit && (
        <DepositModal
          onClose={() => setShowDeposit(false)}
          onDeposit={(amt) => {
            deposit(amt)
            setShowDeposit(false)
          }}
        />
      )}

      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800 bg-black">
        <span className="text-sm font-mono text-cyan-400">POLYBOT v2.4</span>
        <span className="text-xs font-mono text-gray-500">{uptime}</span>
        <span className="text-sm font-mono tabular-nums text-gray-400">
          <LivePriceDisplay livePriceRef={livePriceRef} />
        </span>
      </div>

      {/* Main Grid */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 flex min-h-0">
          {/* Left: Live Feed (60-70%) */}
          <div className="w-[65%] min-w-0 flex flex-col border-r border-gray-800">
            <LiveFeed logs={consoleLogs} />
          </div>

          {/* Right: Session + Controls (30-40%) */}
          <div className="w-[35%] flex flex-col border-gray-800">
            <div className="border-b border-gray-800 p-3">
              <div className="text-xs font-mono text-gray-500 mb-2">SESSION</div>
              <div className="space-y-1 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-gray-500">Profit</span>
                  <span className={sessionTotalProfit >= 0 ? 'text-green-500' : 'text-red-500'}>
                    {sessionTotalProfit >= 0 ? '+' : ''}${sessionTotalProfit.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Orders</span>
                  <span className="text-gray-400">{sessionOrders}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Win Rate</span>
                  <span className="text-cyan-400">{winRate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Balance</span>
                  <span className="text-green-500">${balance.toFixed(2)}</span>
                </div>
              </div>
            </div>
            <div className="flex-1 p-3 flex flex-col">
              <div className="text-xs font-mono text-gray-500 mb-2">CONTROLS</div>
              <button
                type="button"
                onClick={isRunning ? stopBot : startBot}
                className={`w-full py-2 font-mono text-sm border rounded-none ${
                  isRunning
                    ? 'border-yellow-500 text-yellow-500 hover:bg-yellow-500/10'
                    : 'border-green-500 text-green-500 hover:bg-green-500/10'
                }`}
              >
                {isRunning ? '[ STOP BOT ]' : '[ START BOT ]'}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom: Chart */}
        <div className="h-[150px] border-t border-gray-800 p-2">
          <TerminalSparkline
            initialData={initialData}
            subscribeToTick={subscribeToTick}
            height={134}
          />
        </div>
      </div>
    </div>
  )
}
