/**
 * Simulated bot activity feed. Minimalist, anonymous.
 * Format: user4821   $45 — no verbs, no win/loss.
 */

import { useCallback, useState } from 'react'

export interface ActivityItem {
  id: string
  username: string
  amount: number
}

const MAX_ITEMS = 12
const STAGGER_MS = 300

function randomUsername(): string {
  const digits = 4 + Math.floor(Math.random() * 2) // 4 or 5 digits
  let n = ''
  for (let i = 0; i < digits; i++) n += Math.floor(Math.random() * 10)
  return `user${n}`
}

function randomAmount(): number {
  return 1 + Math.floor(Math.random() * 240) // $1 to $240
}

export function useActivityFeed() {
  const [items, setItems] = useState<ActivityItem[]>([])

  const addItem = useCallback((item: Omit<ActivityItem, 'id'>) => {
    const id = `act_${Date.now()}_${Math.random().toString(36).slice(2)}`
    setItems((prev) => {
      const next = [...prev, { ...item, id }]
      if (next.length > MAX_ITEMS) return next.slice(-MAX_ITEMS)
      return next
    })
  }, [])

  const triggerActivityBatch = useCallback(() => {
    const count = 3 + Math.floor(Math.random() * 6) // 3-8
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        addItem({
          username: randomUsername(),
          amount: randomAmount(),
        })
      }, i * STAGGER_MS)
    }
  }, [addItem])

  return { items, triggerActivityBatch }
}
