'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

import {
  STACK_GROUPS_FILTER,
  STACK_ITEMS,
  STACK_LEARNING,
  PROJECTS,
} from '@/lib/portfolio-data'
import { ActHeader, EASE_OUT_EXPO, MonoTag, Reveal, useCompanion } from './kit'
import { webglSupported } from './three/webgl'

/* Stack constellation — client-only WebGL, code-split */
const OrbitScene = dynamic(() => import('./three/orbit-scene'), { ssr: false })

/* ------------------------------------------------------------------ */
/* ACT 07 — THE STACK                                                  */
/* An operable inventory: filter → inspect → read the honest numbers.  */
/* Left: filter tabs + tech chips. Right: live dossier panel with an   */
/* animated production-confidence meter. Bottom: "loading next         */
/* modules" ticker. Fully keyboard accessible, reduced-motion aware.   */
/* ------------------------------------------------------------------ */

const GROUP_LABEL = 'text-violet-400/90'

function meterColor(level: number): string {
  if (level >= 90) return 'bg-violet-400 shadow-[0_0_12px_rgba(139,92,246,0.8)]'
  if (level >= 80) return 'bg-violet-400/80 shadow-[0_0_10px_rgba(139,92,246,0.5)]'
  return 'bg-zinc-400/80'
}

export default function ActStack() {
  const say = useCompanion((s) => s.say)
  const reduced = useReducedMotion() ?? false

  /* WebGL constellation — mounts only when supported + on-screen */
  const [use3D, setUse3D] = useState(false)
  const [sceneInView, setSceneInView] = useState(false)
  const sceneRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    setUse3D(webglSupported())
  }, [])
  useEffect(() => {
    const el = sceneRef.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => setSceneInView(!!entry?.isIntersecting), {
      threshold: 0.05,
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const [filter, setFilter] = useState<(typeof STACK_GROUPS_FILTER)[number]>('ALL')
  const [activeName, setActiveName] = useState<string>(STACK_ITEMS[0]?.name ?? '')

  const items = useMemo(
    () => (filter === 'ALL' ? STACK_ITEMS : STACK_ITEMS.filter((i) => i.group === filter)),
    [filter]
  )

  /* derived: if the current filter hides the selection, fall back to the first visible item */
  const active = useMemo(() => {
    const found = STACK_ITEMS.find((i) => i.name === activeName)
    if (found && items.some((i) => i.name === activeName)) return found
    return items[0]
  }, [activeName, items])

  /* EO-7 cue — once, on first view, desktop only */
  const cued = useRef(false)
  const sectionRef = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return
        if (cued.current || window.innerWidth < 640) return
        cued.current = true
        window.setTimeout(() => say('Pick a module. The numbers are honest — mostly.'), 400)
      },
      { threshold: 0.25 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [say])

  const select = useCallback((name: string) => setActiveName(name), [])

  const usedProjects = useMemo(
    () =>
      (active?.usedIn ?? [])
        .map((num) => PROJECTS.find((p) => p.num === num))
        .filter((p): p is (typeof PROJECTS)[number] => !!p),
    [active]
  )

  /* keyboard ring navigation inside the chip grid */
  const gridRef = useRef<HTMLDivElement>(null)
  const onGridKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft' && e.key !== 'ArrowDown' && e.key !== 'ArrowUp')
        return
      const chips = Array.from(
        gridRef.current?.querySelectorAll<HTMLButtonElement>('button[data-chip]') ?? []
      )
      const idx = chips.findIndex((c) => c.getAttribute('aria-pressed') === 'true')
      const next =
        e.key === 'ArrowRight' || e.key === 'ArrowDown'
          ? chips[(idx + 1) % chips.length]
          : chips[(idx - 1 + chips.length) % chips.length]
      if (next) {
        e.preventDefault()
        next.focus()
        select(next.dataset.chip ?? '')
      }
    },
    [select]
  )

  return (
    <section
      id="stack"
      ref={sectionRef}
      className="relative"
      aria-label="The stack — tools and practices"
    >
      {/* ghost numeral watermark */}
      <span aria-hidden className="ghost-num absolute -top-4 right-0 hidden lg:block">
        07
      </span>

      <div className="relative mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32 lg:py-40">
        <ActHeader
          index="07"
          code="THE STACK"
          title={
            <>
              Tools are tools.
              <br />
              Judgment is the stack.
            </>
          }
          blurb="Every technology here survived contact with production. Select a module to read the honest dossier — confidence, mileage, and where it shipped."
        />

        {/* ------------------- 3D constellation banner ------------------- */}
        <Reveal delay={0.1}>
          <div
            ref={sceneRef}
            className="relative mt-12 h-[300px] overflow-hidden rounded-2xl border border-white/10 bg-[radial-gradient(ellipse_60%_80%_at_50%_50%,rgba(139,92,246,0.1),transparent_70%)] sm:mt-16 sm:h-[360px]"
            aria-hidden
          >
            {use3D && !reduced ? <OrbitScene active={sceneInView} /> : null}
            {/* corner HUD labels */}
            <span className="font-mono-tight absolute left-4 top-3 text-[9px] text-violet-300/80">
              THE STACK · ORBITAL MAP
            </span>
            <span className="font-mono-tight absolute bottom-3 right-4 text-[9px] text-zinc-600">
              4 BANDS · REALTIME RENDER
            </span>
            {/* fade into page background at the edges */}
            <span className="pointer-events-none absolute inset-0 shadow-[inset_0_0_60px_rgba(5,5,5,0.9)]" />
          </div>
        </Reveal>

        {/* ------------------- filter tabs ------------------- */}
        <Reveal delay={0.1}>
          <div
            role="toolbar"
            aria-label="Filter stack by category"
            className="mt-14 flex flex-wrap items-center gap-2"
          >
            {STACK_GROUPS_FILTER.map((g) => {
              const isActive = filter === g
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => setFilter(g)}
                  aria-pressed={isActive}
                  className={[
                    'font-mono-tight min-h-[36px] rounded-full border px-4 text-[10px] transition-all duration-300',
                    isActive
                      ? 'border-violet-400/60 bg-violet-500/15 text-violet-200 shadow-[0_0_20px_rgba(139,92,246,0.25)]'
                      : 'border-white/10 text-zinc-500 hover:border-violet-400/40 hover:text-violet-300',
                  ].join(' ')}
                >
                  {g}
                  <span className="ml-2 text-zinc-600">
                    {String(
                      g === 'ALL' ? STACK_ITEMS.length : STACK_ITEMS.filter((i) => i.group === g).length
                    ).padStart(2, '0')}
                  </span>
                </button>
              )
            })}
          </div>
        </Reveal>

        {/* ------------------- grid + dossier ------------------- */}
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px] lg:gap-8">
          {/* chip inventory */}
          <Reveal delay={0.16}>
            <div
              ref={gridRef}
              onKeyDown={onGridKeyDown}
              role="group"
              aria-label="Technology modules — arrow keys navigate"
              className="flex flex-wrap content-start gap-2.5"
            >
              <AnimatePresence mode="popLayout" initial={false}>
                {items.map((item, i) => {
                  const isActive = item.name === active?.name
                  return (
                    <motion.button
                      layout
                      key={item.name}
                      data-chip={item.name}
                      type="button"
                      onClick={() => select(item.name)}
                      aria-pressed={isActive}
                      initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: -8 }}
                      transition={{
                        duration: 0.35,
                        delay: reduced ? 0 : Math.min(i * 0.025, 0.3),
                        ease: EASE_OUT_EXPO,
                      }}
                      className={[
                        'font-mono-tight group relative min-h-[44px] rounded-lg border px-3.5 text-[11px] tracking-wider transition-all duration-300',
                        isActive
                          ? 'border-violet-400/70 bg-violet-500/15 text-violet-100 shadow-[0_0_24px_rgba(139,92,246,0.3)]'
                          : 'border-white/10 bg-white/[0.03] text-zinc-400 hover:-translate-y-0.5 hover:border-violet-400/40 hover:bg-violet-500/[0.07] hover:text-violet-200 hover:shadow-[0_0_18px_rgba(139,92,246,0.18)]',
                      ].join(' ')}
                    >
                      {item.name.toUpperCase()}
                      {/* active corner ticks */}
                      {isActive && (
                        <motion.span
                          layoutId="stack-corner"
                          aria-hidden
                          transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}
                          className="pointer-events-none absolute -right-1 -top-1 h-2 w-2 rounded-full bg-violet-400 shadow-[0_0_10px_rgba(139,92,246,1)]"
                        />
                      )}
                    </motion.button>
                  )
                })}
              </AnimatePresence>
            </div>
          </Reveal>

          {/* dossier panel */}
          <Reveal delay={0.22} className="lg:sticky lg:top-28 lg:self-start">
            <div className="glass accent-glow relative overflow-hidden rounded-2xl border-violet-400/20 p-6">
              {/* header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <MonoTag className="text-violet-400/90">MODULE DOSSIER</MonoTag>
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.h3
                      key={active?.name}
                      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduced ? { opacity: 0 } : { opacity: 0, y: -10 }}
                      transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}
                      className="mt-2 text-2xl font-semibold tracking-tight text-zinc-100"
                    >
                      {active?.name}
                    </motion.h3>
                  </AnimatePresence>
                  <p className={`font-mono-tight mt-1 text-[10px] ${GROUP_LABEL}`}>
                    {active?.group} · IN SERVICE SINCE {active?.since}
                  </p>
                </div>
                <span
                  aria-hidden
                  className="font-mono-tight rounded-md border border-white/10 px-2 py-1 text-[9px] text-zinc-500"
                >
                  {String((active?.name ?? '').length).padStart(2, '0')} CH
                </span>
              </div>

              {/* confidence meter */}
              <div className="mt-6" role="group" aria-label={`Production confidence ${active?.level} percent`}>
                <div className="flex items-center justify-between">
                  <MonoTag>PROD. CONFIDENCE</MonoTag>
                  <span className="font-mono text-sm tabular-nums text-violet-200 text-glow">
                    {active?.level}%
                  </span>
                </div>
                <div
                  aria-hidden
                  className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]"
                >
                  <motion.div
                    key={`${active?.name}-meter`}
                    initial={reduced ? { scaleX: (active?.level ?? 0) / 100 } : { scaleX: 0 }}
                    animate={{ scaleX: (active?.level ?? 0) / 100 }}
                    transition={{ duration: reduced ? 0 : 0.8, ease: EASE_OUT_EXPO }}
                    className={`h-full origin-left rounded-full ${meterColor(active?.level ?? 0)}`}
                  />
                </div>
                {/* segmented ticks — subtle hardware feel */}
                <div aria-hidden className="mt-1.5 flex justify-between">
                  {Array.from({ length: 11 }).map((_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 w-px ${i * 10 <= (active?.level ?? 0) ? 'bg-violet-400/50' : 'bg-white/10'}`}
                    />
                  ))}
                </div>
              </div>

              {/* note */}
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={`${active?.name}-note`}
                  initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
                  transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}
                  className="mt-5 min-h-[60px] text-sm leading-relaxed text-zinc-300"
                >
                  {active?.note}
                </motion.p>
              </AnimatePresence>

              {/* battle-tested in */}
              <div className="mt-4 border-t border-white/10 pt-4">
                <MonoTag>BATTLE-TESTED IN</MonoTag>
                {usedProjects.length > 0 ? (
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {usedProjects.map((p) => (
                      <a
                        key={p.id}
                        href="#work"
                        className="font-mono-tight group inline-flex min-h-[32px] items-center gap-1.5 rounded-md border border-white/10 px-2.5 text-[10px] text-zinc-400 transition-all duration-300 hover:border-violet-400/50 hover:text-violet-300"
                      >
                        <span className="text-violet-400/70">{p.num}</span>
                        {p.name.toUpperCase()}
                        <span aria-hidden className="text-zinc-600 transition-transform duration-300 group-hover:translate-x-0.5">
                          →
                        </span>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-zinc-600">
                    Internal tooling & experiments — no client shipment yet.
                  </p>
                )}
              </div>

              {/* decorative scanline */}
              <span
                aria-hidden
                className="animate-scanline pointer-events-none absolute inset-x-0 h-16 bg-gradient-to-b from-transparent via-violet-400/[0.05] to-transparent"
              />
            </div>
          </Reveal>
        </div>

        {/* ------------------- learning ticker ------------------- */}
        <Reveal delay={0.1}>
          <div className="mt-12 overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
            <div className="flex items-stretch">
              <div className="font-mono-tight flex shrink-0 items-center gap-2 border-r border-white/10 px-4 py-3 text-[10px] text-violet-300">
                <span className="relative flex h-1.5 w-1.5" aria-hidden>
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-60 motion-reduce:animate-none" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-violet-400" />
                </span>
                LOADING NEXT MODULES
              </div>
              <div className="relative flex-1 overflow-hidden py-3" aria-hidden>
                <div className="animate-ticker flex w-max items-center gap-8 pl-8">
                  {[...STACK_LEARNING, ...STACK_LEARNING].map((tech, i) => (
                    <span key={`${tech}-${i}`} className="font-mono-tight flex items-center gap-8 text-[11px] text-zinc-500">
                      {tech}
                      <span className="h-1 w-1 rounded-full bg-violet-400/50" />
                    </span>
                  ))}
                </div>
                {/* edge fades */}
                <span className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-[#050505] to-transparent" />
                <span className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[#050505] to-transparent" />
              </div>
              <span className="sr-only">
                Currently learning: {STACK_LEARNING.join(', ')}
              </span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
