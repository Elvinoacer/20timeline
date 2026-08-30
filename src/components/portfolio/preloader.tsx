'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

import { EASE_OUT_EXPO } from './kit'

const BOOT_LINES = [
  'LOADING PROJECTS ... OK',
  'LOADING EXPERIMENTS ... OK',
  'LOADING ENGINEERING ... OK',
] as const

/* ------------------------------------------------------------------ */
/* Preloader — EO://BOOT terminal sequence                             */
/* ------------------------------------------------------------------ */

export default function Preloader({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0)
  const [linesShown, setLinesShown] = useState(0)
  const [ready, setReady] = useState(false)

  const doneRef = useRef(false)
  const onDoneRef = useRef(onDone)
  useEffect(() => {
    onDoneRef.current = onDone
  })

  /* onDone must fire exactly once — click / keypress / timeline all funnel here */
  const finish = useCallback(() => {
    if (doneRef.current) return
    doneRef.current = true
    onDoneRef.current()
  }, [])

  const reduced = useReducedMotion() ?? false

  useEffect(() => {
    const onKey = () => finish()
    window.addEventListener('keydown', onKey)

    let timers: number[] = []
    let interval = 0

    if (reduced) {
      /* reduced motion: jump straight to ready, total ≤ 400ms */
      timers = [
        window.setTimeout(() => setProgress(100), 0),
        window.setTimeout(() => setLinesShown(BOOT_LINES.length), 0),
        window.setTimeout(() => setReady(true), 0),
        window.setTimeout(finish, 320),
      ]
    } else {
      let value = 0
      interval = window.setInterval(() => {
        value = Math.min(100, value + 2 + Math.random() * 3.2)
        setProgress(value)
        if (value >= 100 && interval !== 0) {
          window.clearInterval(interval)
          interval = 0
        }
      }, 40)

      timers = [
        window.setTimeout(() => setLinesShown(1), 1280),
        window.setTimeout(() => setLinesShown(2), 1520),
        window.setTimeout(() => setLinesShown(3), 1760),
        window.setTimeout(() => setReady(true), 2000),
        window.setTimeout(finish, 2400),
      ]
    }

    return () => {
      window.removeEventListener('keydown', onKey)
      if (interval !== 0) window.clearInterval(interval)
      timers.forEach((t) => window.clearTimeout(t))
    }
  }, [finish, reduced])

  return (
    <motion.div
      role="status"
      aria-live="polite"
      onClick={finish}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
      className="fixed inset-0 z-[100] select-none bg-[#050505]"
    >
      {/* faint scanline sweep */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-scanline absolute inset-x-0 top-0 h-full">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-violet-300/30 to-transparent" />
        </div>
      </div>

      {/* corner brackets */}
      <div aria-hidden className="pointer-events-none absolute inset-4 sm:inset-6">
        <span className="absolute left-0 top-0 h-5 w-5 border-l border-t border-violet-400/40" />
        <span className="absolute right-0 top-0 h-5 w-5 border-r border-t border-violet-400/40" />
        <span className="absolute bottom-0 left-0 h-5 w-5 border-b border-l border-violet-400/40" />
        <span className="absolute bottom-0 right-0 h-5 w-5 border-b border-r border-violet-400/40" />
      </div>

      {/* boot id — top-left corner area */}
      <span className="font-mono-tight absolute left-6 top-6 text-[10px] text-zinc-600 sm:left-8 sm:top-8">
        EO://BOOT v2.6
      </span>

      {/* center terminal stack */}
      <div className="relative flex h-full flex-col items-center justify-center gap-10 px-6">
        <div className="flex h-14 items-center justify-center">
          {ready ? (
            <motion.p
              initial={{ opacity: 0, scale: 1.06 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
              className="text-glow text-3xl font-semibold tracking-tight text-violet-300 sm:text-4xl"
            >
              SYSTEM READY.
            </motion.p>
          ) : (
            <p className="font-mono-tight text-xs text-zinc-300 sm:text-sm">
              SYSTEM INITIALIZING...
              <span aria-hidden className="animate-blink-caret ml-1.5 text-violet-400">
                ▍
              </span>
            </p>
          )}
        </div>

        <div className="flex w-64 max-w-full flex-col gap-3">
          <div className="flex items-center justify-between gap-4">
            <div className="h-[2px] flex-1 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-gradient-to-r from-violet-600 via-violet-400 to-violet-300 shadow-[0_0_12px_rgba(139,92,246,0.7)] transition-[width] duration-150 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="font-mono-tight w-11 text-right text-[10px] text-zinc-500">
              {String(Math.floor(progress)).padStart(3, '0')}%
            </span>
          </div>

          {/* sequential boot log */}
          <div aria-hidden className="flex h-16 flex-col justify-end gap-1.5">
            {BOOT_LINES.slice(0, linesShown).map((line) => (
              <motion.span
                key={line}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}
                className="font-mono-tight text-[10px] text-zinc-500"
              >
                {line.slice(0, -2)}
                <span className="text-violet-400">OK</span>
              </motion.span>
            ))}
          </div>
        </div>
      </div>

      {/* skip hint */}
      <span className="font-mono-tight absolute inset-x-0 bottom-6 text-center text-[10px] text-zinc-600">
        PRESS ANY KEY TO SKIP
      </span>
    </motion.div>
  )
}
