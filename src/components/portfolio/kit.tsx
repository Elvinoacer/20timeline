'use client'

import { create } from 'zustand'
import { motion, useReducedMotion } from 'framer-motion'
import { useRef, useState, type ReactNode, type MouseEvent } from 'react'
import { cn } from '@/lib/utils'

/* ------------------------------------------------------------------ */
/* Shared motion constants                                             */
/* ------------------------------------------------------------------ */

export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const

/* ------------------------------------------------------------------ */
/* EO-7 companion store — sections call say() when they enter view     */
/* ------------------------------------------------------------------ */

type CompanionState = {
  message: string | null
  ts: number
  say: (text: string) => void
  dismiss: () => void
}

export const useCompanion = create<CompanionState>((set) => ({
  message: null,
  ts: 0,
  say: (text) => set({ message: text, ts: Date.now() }),
  dismiss: () => set({ message: null }),
}))

/* ------------------------------------------------------------------ */
/* Reveal — scroll-triggered fade/rise wrapper                         */
/* ------------------------------------------------------------------ */

export function Reveal({
  children,
  delay = 0,
  y = 32,
  once = true,
  className,
}: {
  children: ReactNode
  delay?: number
  y?: number
  once?: boolean
  className?: string
}) {
  const reduced = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-10% 0px -10% 0px' }}
      transition={{ duration: 0.9, delay, ease: EASE_OUT_EXPO }}
    >
      {children}
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/* MonoTag — tiny mono system-language chip                            */
/* ------------------------------------------------------------------ */

export function MonoTag({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'font-mono-tight inline-flex items-center gap-2 text-[10px] text-zinc-500',
        className
      )}
    >
      {children}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/* ActHeader — consistent act numbering + giant title                  */
/* ------------------------------------------------------------------ */

export function ActHeader({
  index,
  code,
  title,
  blurb,
  className,
}: {
  index: string
  code: string
  title: ReactNode
  blurb?: string
  className?: string
}) {
  return (
    <div className={cn('relative', className)}>
      <Reveal>
        <div className="flex items-center gap-4">
          <span className="font-mono-tight text-[10px] text-violet-400/90">ACT {index}</span>
          <span className="hairline w-16" aria-hidden />
          <MonoTag>{code}</MonoTag>
        </div>
      </Reveal>
      <Reveal delay={0.08}>
        <h2 className="mt-6 bg-gradient-to-b from-white via-zinc-100 to-zinc-400 bg-clip-text text-4xl font-semibold leading-[1.02] tracking-tight text-transparent sm:text-5xl lg:text-7xl">
          {title}
        </h2>
      </Reveal>
      {blurb ? (
        <Reveal delay={0.16}>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-zinc-400">{blurb}</p>
        </Reveal>
      ) : null}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Magnetic — element gently follows the pointer                       */
/* ------------------------------------------------------------------ */

export function Magnetic({
  children,
  strength = 0.32,
  className,
}: {
  children: ReactNode
  strength?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const reduced = useReducedMotion()

  function onMove(e: MouseEvent<HTMLDivElement>) {
    if (reduced || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = e.clientX - (rect.left + rect.width / 2)
    const y = e.clientY - (rect.top + rect.height / 2)
    setOffset({ x: x * strength, y: y * strength })
  }

  return (
    <motion.div
      ref={ref}
      className={cn('inline-block', className)}
      onMouseMove={onMove}
      onMouseLeave={() => setOffset({ x: 0, y: 0 })}
      animate={{ x: offset.x, y: offset.y }}
      transition={{ type: 'spring', stiffness: 180, damping: 16, mass: 0.4 }}
    >
      {children}
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/* ActDivider — system-language chapter transition between acts        */
/* ------------------------------------------------------------------ */

export function ActDivider({ done, next }: { done: string; next: string }) {
  return (
    <div aria-hidden className="mx-auto flex max-w-6xl items-center gap-4 px-5 py-8 sm:px-8">
      <MonoTag className="shrink-0">▸ EOF / {done}</MonoTag>
      <span className="hairline flex-1" />
      <span className="h-1 w-1 shrink-0 rounded-full bg-violet-400/80 shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
      <span className="hairline flex-1" />
      <MonoTag className="shrink-0">NEXT: {next}</MonoTag>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* PrimaryButton — signature CTA with glow + magnetic hover            */
/* ------------------------------------------------------------------ */

export function PrimaryButton({
  children,
  onClick,
  type = 'button',
  disabled,
  className,
}: {
  children: ReactNode
  onClick?: () => void
  type?: 'button' | 'submit'
  disabled?: boolean
  className?: string
}) {
  return (
    <Magnetic strength={0.18}>
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        data-magnetic
        className={cn(
          'group relative inline-flex min-h-[48px] items-center gap-3 overflow-hidden rounded-full',
          'border border-violet-400/30 bg-violet-500/10 px-8 py-3.5',
          'font-mono-tight text-xs text-violet-100 transition-all duration-300',
          'hover:border-violet-300/60 hover:bg-violet-500/20 hover:shadow-[0_0_40px_rgba(139,92,246,0.35)]',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
      >
        <span
          className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full"
          aria-hidden
        />
        {children}
      </button>
    </Magnetic>
  )
}
