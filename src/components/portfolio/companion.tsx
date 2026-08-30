'use client'

import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import { EASE_OUT_EXPO, useCompanion } from './kit'

/* ------------------------------------------------------------------ */
/* Companion — EO-7 bot, reactive speech bubbles via useCompanion      */
/* ------------------------------------------------------------------ */

export default function Companion() {
  const message = useCompanion((s) => s.message)
  const ts = useCompanion((s) => s.ts)
  const dismiss = useCompanion((s) => s.dismiss)

  /* auto-dismiss 6.5s after the latest message (keyed on ts) */
  useEffect(() => {
    if (message === null) return
    const timer = window.setTimeout(dismiss, 6500)
    return () => window.clearTimeout(timer)
  }, [message, ts, dismiss])

  return (
    <div className="fixed bottom-4 left-4 z-[70] flex origin-bottom-left scale-90 items-end gap-3 sm:bottom-6 sm:left-6 sm:scale-100">
      {/* bot avatar (decorative) */}
      <div className="relative h-11 w-11 shrink-0" aria-hidden>
        <div className="glass animate-float-slow flex h-11 w-11 items-center justify-center rounded-xl">
          <span className="flex flex-col items-center gap-1">
            <span className="flex gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(139,92,246,1)]" />
              <span className="h-1.5 w-1.5 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(139,92,246,1)]" />
            </span>
            <span className="h-0.5 w-3 rounded-full bg-zinc-400/80" />
          </span>
        </div>
        {/* green pulsing status dot */}
        <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full border border-[#050505] bg-emerald-400" />
        </span>
      </div>

      {/* speech bubble */}
      <AnimatePresence mode="popLayout">
        {message !== null && (
          <motion.div
            key={ts}
            initial={{ opacity: 0, y: 14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
            className="glass max-w-[240px] rounded-2xl p-3.5"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono-tight text-[9px] text-violet-300/90">EO-7</span>
              <button
                type="button"
                onClick={dismiss}
                aria-label="Dismiss EO-7 message"
                className="-mr-1.5 -mt-1 flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-200"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                  <path d="M1.5 1.5l7 7m0-7l-7 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <p aria-live="polite" className="mt-1 text-sm leading-relaxed text-zinc-200">
              {message}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
