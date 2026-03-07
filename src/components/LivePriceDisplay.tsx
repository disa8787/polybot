/**
 * Displays live price from ref, updating at most once per second to avoid
 * re-rendering the whole app on every WebSocket tick.
 */
import { useEffect, useState } from 'react'

interface LivePriceDisplayProps {
  livePriceRef: React.MutableRefObject<number | null>
  className?: string
}

export function LivePriceDisplay({ livePriceRef, className = '' }: LivePriceDisplayProps) {
  const [price, setPrice] = useState<number | null>(livePriceRef.current)

  useEffect(() => {
    const id = setInterval(() => {
      const p = livePriceRef.current
      if (p != null) setPrice(p)
    }, 1000)
    return () => clearInterval(id)
  }, [livePriceRef])

  return (
    <span className={className}>
      {price != null
        ? `$${price.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
        : 'Loading...'}
    </span>
  )
}
