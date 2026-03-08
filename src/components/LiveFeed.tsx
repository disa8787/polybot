import { useEffect, useRef } from 'react'
import type { ConsoleLog, LogTag } from '../contexts/BotContext'

interface LiveFeedProps {
  logs: ConsoleLog[]
}

const TAG_COLORS: Record<LogTag, string> = {
  INFO: 'text-cyan-400',
  EXEC: 'text-amber-500',
  FILLED: 'text-green-500',
  SLIPPED: 'text-red-500',
  ERR: 'text-red-500',
}

const SCROLL_THRESHOLD = 48

export function LiveFeed({ logs }: LiveFeedProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const prevLenRef = useRef(0)

  useEffect(() => {
    if (logs.length <= prevLenRef.current) {
      prevLenRef.current = logs.length
      return
    }
    prevLenRef.current = logs.length

    const el = scrollRef.current
    if (!el) return

    const scrollBottom = el.scrollTop + el.clientHeight
    const nearBottom = scrollBottom >= el.scrollHeight - SCROLL_THRESHOLD

    if (nearBottom) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logs.length])

  return (
    <div className="h-full flex flex-col border border-gray-800 border-t-0 bg-black overflow-hidden">
      <div className="px-2 py-1 border-b border-gray-800 text-xs font-mono text-gray-500 shrink-0">
        LIVE FEED
      </div>
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto overflow-x-hidden p-2 font-mono text-xs relative live-feed-scroll"
      >
        {logs.length === 0 ? (
          <p className="text-gray-600 py-1">Awaiting input...</p>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className="flex gap-2 h-5 items-center shrink-0"
            >
              <span className="text-gray-600 shrink-0 font-mono text-[11px] tabular-nums">
                {log.timestamp}
              </span>
              <span className={`shrink-0 font-mono text-xs ${TAG_COLORS[log.tag]}`}>
                [{log.tag}]
              </span>
              <span className="text-gray-400 font-mono text-xs min-w-0">
                {log.message}
              </span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
