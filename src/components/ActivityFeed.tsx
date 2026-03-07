/**
 * Minimalist simulated activity feed.
 * Format: user4821   $45 — no verbs, neutral styling.
 */

import type { ActivityItem } from '../hooks/useActivityFeed'

interface ActivityFeedProps {
  items: ActivityItem[]
}

export function ActivityFeed({ items }: ActivityFeedProps) {
  if (items.length === 0) return null

  return (
    <div className="rounded-lg border border-gray-800 bg-[#0f0f0f] overflow-hidden">
      <div className="max-h-40 overflow-y-auto">
        <div className="divide-y divide-gray-800/80">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between py-2 px-3 text-xs font-mono text-gray-400"
            >
              <span>{item.username}</span>
              <span className="tabular-nums">${item.amount}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
