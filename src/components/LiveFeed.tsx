import { useEffect, useRef } from 'react'
import type { ConsoleLog, LogTag } from '../contexts/BotContext'

interface LiveFeedProps {
  logs: ConsoleLog[]
}

const TAG_COLORS: Record<LogTag, string> = {
  INFO: 'text-gray-500',
  SCAN: 'text-cyan-400',
  EDGE: 'text-yellow-500',
  EXEC: 'text-amber-500',
  WIN: 'text-green-400', /* Neon green */
  LOSS: 'text-red-500',
  ERR: 'text-red-500',
}

export function LiveFeed({ logs }: LiveFeedProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs.length])

  return (
    <div className="h-full flex flex-col border border-gray-800 border-t-0 bg-black overflow-hidden">
      <div className="px-2 py-1 border-b border-gray-800 text-xs font-mono text-gray-500">
        LIVE FEED
      </div>
      <div className="flex-1 overflow-y-auto p-2 font-mono text-xs">
        {logs.length === 0 ? (
          <p className="text-gray-600">Awaiting input...</p>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className="flex gap-2 py-0.5 items-baseline"
            >
              <span className="text-gray-600 shrink-0 font-mono text-xs">{log.timestamp}</span>
              <span className={`shrink-0 font-mono text-xs ${TAG_COLORS[log.tag]}`}>
                [{log.tag}]
              </span>
              <span className="text-gray-400 break-all font-mono text-xs">{log.message}</span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
