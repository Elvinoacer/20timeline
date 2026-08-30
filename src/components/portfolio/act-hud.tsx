'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

import { EASE_OUT_EXPO } from './kit'

/* ------------------------------------------------------------------ */
/* ActHud — right-edge act rail: tracks the current act, jumps on      */
/* click. Desktop only (lg+), hidden until the system has booted.      */
/* ------------------------------------------------------------------ */

const ACTS = [
  { id: 'entry', label: 'ENTRY', num: '01' },
  { id: 'engine', label: 'ENGINE', num: '02' },
  { id: 'process', label: 'PIPELINE', num: '03' },
  { id: 'work', label: 'WORK', num: '04' },
  { id: 'lab', label: 'LAB', num: '05' },
  { id: 'human', label: 'HUMAN', num: '06' },
  { id: 'stack', label: 'STACK', num: '07' },
  { id: 'signal', label: 'SIGNAL', num: '08' },
]

export default function ActHud({ booted }: { booted: boolean }) {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const sections = ACTS.map((a) => document.getElementById(a.id)).filter(
      (el): el is HTMLElement => !!el
    )
    if (sections.length === 0) return

    const visible = new Map<string, number>()

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          visible.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0)
        }
        let best = ''
        let bestRatio = 0
        for (const [id, ratio] of visible) {
          if (ratio > bestRatio) {
            bestRatio = ratio
            best = id
          }
        }
        if (best) {
          const idx = ACTS.findIndex((a) => a.id === best)
          if (idx >= 0) setActive(idx)
        }
      },
      { rootMargin: '-30% 0px -30% 0px', threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] }
    )

    sections.forEach((s) => io.observe(s))
    return () => io.disconnect()
  }, [])

  const jump = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <motion.aside
      aria-label="Act navigation rail"
      initial={{ opacity: 0, x: 12 }}
      animate={booted ? { opacity: 1, x: 0 } : { opacity: 0, x: 12 }}
      transition={{ duration: 0.8, delay: 0.6, ease: EASE_OUT_EXPO }}
      className="pointer-events-none fixed right-5 top-1/2 z-[60] hidden -translate-y-1/2 lg:block xl:right-8"
    >
      <div className="pointer-events-auto flex flex-col items-end gap-3.5">
        {ACTS.map((act, i) => {
          const isActive = i === active
          return (
            <button
              key={act.id}
              type="button"
              onClick={() => jump(act.id)}
              aria-label={`Jump to ACT ${act.num} — ${act.label}`}
              aria-current={isActive ? 'true' : undefined}
              className="group flex min-h-[20px] items-center justify-end gap-2.5"
            >
              <span
                className={`font-mono-tight text-[9px] transition-all duration-300 ${
                  isActive
                    ? 'translate-x-0 text-violet-300 opacity-100'
                    : 'translate-x-1 text-zinc-500 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'
                }`}
              >
                {act.num} {act.label}
              </span>
              <span className="relative flex h-3 w-3 items-center justify-center">
                <span
                  className={`absolute inset-0 rounded-full transition-all duration-300 ${
                    isActive
                      ? 'scale-100 bg-violet-400/25'
                      : 'scale-0 bg-white/10 group-hover:scale-100'
                  }`}
                />
                <span
                  className={`relative h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                    isActive
                      ? 'scale-125 bg-violet-400 shadow-[0_0_10px_rgba(139,92,246,0.9)]'
                      : 'bg-white/25 group-hover:bg-white/60'
                  }`}
                />
              </span>
            </button>
          )
        })}

        {/* act fraction counter */}
        <div className="mt-1 flex flex-col items-end gap-1 border-t border-white/10 pt-3">
          <span className="font-mono-tight text-[9px] text-violet-300/90">
            {ACTS[active]?.num ?? '01'}
          </span>
          <span className="font-mono-tight text-[9px] text-zinc-600">/ 08</span>
        </div>
      </div>
    </motion.aside>
  )
}
