'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import { EASE_OUT_EXPO } from './kit'
import { NAV_LINKS } from '@/lib/portfolio-data'

/* ------------------------------------------------------------------ */
/* KeyboardShortcuts — power-user layer:                               */
/*   1–8  jump to acts      ?   toggle this overlay                    */
/*   ⌘K / Ctrl+K / `  console (handled in console.tsx)                 */
/* The overlay is a glass "OPERATOR MANUAL" panel, Escape closes.      */
/* ------------------------------------------------------------------ */

export default function KeyboardShortcuts() {
  const [open, setOpen] = useState(false)
  const openRef = useRef(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    openRef.current = open
  }, [open])

  const typingTarget = (target: EventTarget | null) => {
    const el = target as HTMLElement | null
    return (
      !!el &&
      (el.tagName === 'INPUT' ||
        el.tagName === 'TEXTAREA' ||
        el.tagName === 'SELECT' ||
        el.isContentEditable)
    )
  }

  const close = useCallback(() => setOpen(false), [])

  /* hotkeys: "?" toggles the overlay, 1–8 jump to acts */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (typingTarget(e.target) || e.metaKey || e.ctrlKey || e.altKey) return
      /* console open? let it own the keyboard except its own inputs */
      if (document.body.dataset.consoleOpen === 'true') return

      if (e.key === '?') {
        e.preventDefault()
        setOpen((v) => !v)
        return
      }

      const n = Number(e.key)
      if (!Number.isNaN(n) && n >= 1 && n <= NAV_LINKS.length) {
        const link = NAV_LINKS[n - 1]
        const el = document.getElementById(link.href.replace('#', ''))
        if (el) {
          e.preventDefault()
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  /* escape closes + focus the panel when it opens */
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        close()
      }
    }
    window.addEventListener('keydown', onKey)
    const id = window.setTimeout(() => panelRef.current?.focus(), 60)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.clearTimeout(id)
    }
  }, [open, close])

  const rows: { keys: string[]; label: string }[] = [
    { keys: ['⌘', 'K'], label: 'OPEN EO-7 CONSOLE' },
    { keys: ['`'], label: 'OPEN EO-7 CONSOLE (ALT)' },
    ...NAV_LINKS.map((link, i) => ({
      keys: [String(i + 1)],
      label: `GO TO ACT ${String(i + 1).padStart(2, '0')} — ${link.label}`,
    })),
    { keys: ['?'], label: 'TOGGLE THIS MANUAL' },
    { keys: ['ESC'], label: 'CLOSE ANY OVERLAY' },
  ]

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="eo-shortcuts"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: EASE_OUT_EXPO }}
          className="fixed inset-0 z-[93] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) close()
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Keyboard shortcuts"
        >
          <motion.div
            ref={panelRef}
            tabIndex={-1}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
            className="glass accent-glow w-full max-w-md rounded-2xl border-violet-400/20 p-6 outline-none"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono-tight text-[10px] text-violet-300">
                OPERATOR MANUAL
              </span>
              <span className="font-mono-tight text-[9px] text-zinc-600">v1.0</span>
            </div>

            <div className="mt-5 space-y-1">
              {rows.map((row) => (
                <div
                  key={row.keys.join('+') + row.label}
                  className="flex min-h-[36px] items-center justify-between gap-4 border-b border-white/5 last:border-b-0"
                >
                  <span className="text-xs text-zinc-400">{row.label}</span>
                  <span className="flex shrink-0 gap-1" aria-hidden>
                    {row.keys.map((k) => (
                      <kbd
                        key={k}
                        className="font-mono-tight rounded border border-white/15 bg-white/[0.05] px-1.5 py-0.5 text-[10px] text-zinc-300 shadow-[0_1px_0_rgba(255,255,255,0.06)_inset]"
                      >
                        {k}
                      </kbd>
                    ))}
                  </span>
                </div>
              ))}
            </div>

            <p className="mt-5 text-center text-[11px] leading-relaxed text-zinc-600">
              Every system should be drivable from the keyboard.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
