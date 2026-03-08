import { useEffect, useState } from 'react'
import { useApp } from '../contexts/AppContext'
import { useBot } from '../contexts/BotContext'
import { LiveFeed } from './LiveFeed'
import { EquityChart } from './EquityChart'
import { DepositModal } from './DepositModal'
import { Header } from './Header'

export function TerminalDashboard() {
  const { balance, deposit } = useApp()
  const {
    isRunning,
    consoleLogs,
    sessionTotalProfit,
    sessionOrders,
    sessionStartingBalance,
    equityData,
    startBot,
    stopBot,
  } = useBot()
  const [showDeposit, setShowDeposit] = useState(false)
  const [uptime, setUptime] = useState('00:00:00')
  const [execLatency, setExecLatency] = useState(52)
  const startTimeRef = useState(() => Date.now())[0]

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

  useEffect(() => {
    const id = setInterval(() => {
      setExecLatency(40 + Math.floor(Math.random() * 26))
    }, 1500)
    return () => clearInterval(id)
  }, [])

  const pnlPercent =
    sessionStartingBalance > 0
      ? (sessionTotalProfit / sessionStartingBalance) * 100
      : 0

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

      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800 bg-black">
        <span className="text-sm font-mono text-cyan-400">
          POLYMARKET ARB // RUST ENGINE V0.4.1
        </span>
        <span className="text-xs font-mono text-gray-500 tabular-nums">{uptime}</span>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4 px-4 py-3 border-b border-gray-800 bg-black">
        <div>
          <div className="text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-0.5">
            BALANCE
          </div>
          <div className="text-xl font-mono tabular-nums text-green-500">
            ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-0.5">
            TOTAL P&L
          </div>
          <div
            className={`text-lg font-mono tabular-nums ${
              sessionTotalProfit >= 0 ? 'text-green-500' : 'text-red-500'
            }`}
          >
            {sessionTotalProfit >= 0 ? '+' : ''}${sessionTotalProfit.toFixed(2)}
            {sessionStartingBalance > 0 && (
              <span className="text-sm ml-1 opacity-80">
                ({pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(1)}%)
              </span>
            )}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-0.5">
            EXEC LATENCY
          </div>
          <div className="text-lg font-mono tabular-nums text-cyan-400">{execLatency}ms</div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 flex min-h-0">
          <div className="w-[65%] min-w-0 flex flex-col border-r border-gray-800">
            <LiveFeed logs={consoleLogs} />
          </div>

          <div className="w-[35%] flex flex-col border-gray-800">
            <div className="border-b border-gray-800 p-3">
              <div className="text-xs font-mono text-gray-500 mb-2">SESSION</div>
              <div className="space-y-1 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-gray-500">Orders</span>
                  <span className="text-gray-400">{sessionOrders}</span>
                </div>
              </div>
            </div>
            <div className="flex-1 p-3 flex flex-col justify-center">
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

        {/* Equity Curve */}
        <div className="h-[150px] border-t border-gray-800 p-2">
          <EquityChart data={equityData} height={134} />
        </div>
      </div>
    </div>
  )
}
