import { useCallback, useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import { Download } from 'lucide-react'
import { PNLCard } from './PNLCard'
import type { PNLStats } from '../lib/pnlStats'
import type { ResolvedBet } from '../types'

interface PNLModalProps {
  stats: PNLStats
  highlightedTrade?: ResolvedBet | null
  onClose: () => void
}

export function PNLModal({ stats, highlightedTrade, onClose }: PNLModalProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)

  const captureCard = useCallback(async () => {
    const el = cardRef.current
    if (!el) return

    setIsCapturing(true)
    setImageDataUrl(null)

    try {
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#000000',
        logging: false,
        allowTaint: true,
      })
      const dataUrl = canvas.toDataURL('image/png')
      setImageDataUrl(dataUrl)
    } catch (err) {
      console.error('PNL capture failed:', err)
    } finally {
      setIsCapturing(false)
    }
  }, [])

  const handleDownload = useCallback(() => {
    if (!imageDataUrl) return
    const a = document.createElement('a')
    a.href = imageDataUrl
    a.download = `polybot-pnl-${Date.now()}.png`
    a.click()
  }, [imageDataUrl])

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="flex flex-col items-center gap-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div ref={cardRef}>
          <PNLCard stats={stats} highlightedTrade={highlightedTrade} />
        </div>

        <div className="flex flex-col gap-2 w-full max-w-[320px]">
          {!imageDataUrl ? (
            <button
              type="button"
              onClick={captureCard}
              disabled={isCapturing}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-emerald-600 text-white font-medium disabled:opacity-50"
            >
              {isCapturing ? (
                <>
                  <span className="animate-pulse">Generating...</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Generate Image
                </>
              )}
            </button>
          ) : (
            <>
              <div className="rounded-xl overflow-hidden border border-gray-700 bg-black">
                <img
                  src={imageDataUrl}
                  alt="PNL Card"
                  className="w-full h-auto block"
                  style={{ maxHeight: 200, objectFit: 'contain' }}
                />
              </div>
              <p className="text-xs text-gray-500 text-center">
                Long-press image to save or share
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 text-white font-medium"
                >
                  <Download className="w-4 h-4" />
                  Save Image
                </button>
                <button
                  type="button"
                  onClick={() => setImageDataUrl(null)}
                  className="px-4 py-3 rounded-xl bg-gray-700 text-gray-300 text-sm"
                >
                  Regenerate
                </button>
              </div>
            </>
          )}

          <button
            type="button"
            onClick={onClose}
            className="py-2 text-sm text-gray-500 hover:text-gray-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
