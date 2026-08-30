'use client'

/* ------------------------------------------------------------------ */
/* ACT 02 — THE ENGINEERING WORLD                                      */
/* Four territories (WEB / MOBILE / DESKTOP / SYSTEMS) as glass cards  */
/* with pure-SVG device glyphs, pointer 3D-tilt physics, staggered     */
/* entrance and an EO-7 companion beat.                                */
/* ------------------------------------------------------------------ */

import { useEffect, useRef, useState, type MouseEvent } from 'react'
import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from 'framer-motion'

import { ActHeader, MonoTag, Reveal, useCompanion } from '@/components/portfolio/kit'
import { ENGINE_IMAGES, SYSTEMS } from '@/lib/portfolio-data'
import { cn } from '@/lib/utils'

type SystemEntry = (typeof SYSTEMS)[number]
type SystemKey = SystemEntry['key']

const MAX_TILT = 5 // deg

function clampTilt(v: number) {
  return Math.max(-MAX_TILT, Math.min(MAX_TILT, v))
}

/* ------------------------------------------------------------------ */
/* Device glyphs — pure divs/SVG, no external images                   */
/* Strokes white/30, violet accents, ~64px footprint                   */
/* ------------------------------------------------------------------ */

function WebGlyph() {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" className="h-16 w-16">
      {/* browser shell */}
      <rect x="5.75" y="13.75" width="52.5" height="36.5" rx="5" className="stroke-white/30" strokeWidth="1.5" />
      {/* chrome divider */}
      <path d="M6 24.5h52" className="stroke-white/25" strokeWidth="1.5" />
      {/* traffic dots */}
      <circle cx="13" cy="19.1" r="1.7" className="fill-violet-400/90" />
      <circle cx="19" cy="19.1" r="1.7" className="fill-white/30" />
      <circle cx="25" cy="19.1" r="1.7" className="fill-white/30" />
      {/* address bar */}
      <rect x="31" y="16.5" width="20" height="5.2" rx="2.6" className="stroke-white/20" strokeWidth="1.2" />
      {/* page content */}
      <rect x="11.5" y="31.5" width="26" height="3.2" rx="1.6" className="fill-violet-400/50" />
      <rect x="11.5" y="38.9" width="41" height="3.2" rx="1.6" className="fill-white/15" />
      <rect x="11.5" y="46.3" width="31" height="3.2" rx="1.6" className="fill-white/15" />
    </svg>
  )
}

function MobileGlyph() {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" className="h-16 w-16">
      {/* phone body */}
      <rect x="19.75" y="5.75" width="24.5" height="52.5" rx="6.5" className="stroke-white/30" strokeWidth="1.5" />
      {/* notch */}
      <rect x="27.5" y="9.75" width="9" height="2.5" rx="1.25" className="fill-violet-400/70" />
      {/* home indicator */}
      <rect x="25.5" y="52.75" width="13" height="1.8" rx="0.9" className="fill-white/30" />
      {/* screen content */}
      <rect x="25.5" y="19" width="13" height="3" rx="1.5" className="fill-violet-400/50" />
      <rect x="25.5" y="26.5" width="13" height="3" rx="1.5" className="fill-white/15" />
      <rect x="25.5" y="34" width="8.5" height="3" rx="1.5" className="fill-white/15" />
    </svg>
  )
}

function DesktopGlyph() {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" className="h-16 w-16">
      {/* app window */}
      <rect x="5.75" y="13.75" width="52.5" height="36.5" rx="5" className="stroke-white/30" strokeWidth="1.5" />
      {/* title bar */}
      <path d="M6 23.5h52" className="stroke-white/25" strokeWidth="1.5" />
      <circle cx="12.5" cy="18.6" r="1.5" className="fill-white/30" />
      <circle cx="17.5" cy="18.6" r="1.5" className="fill-white/30" />
      <circle cx="22.5" cy="18.6" r="1.5" className="fill-violet-400/90" />
      {/* sidebar divider */}
      <path d="M21 23.5V50.25" className="stroke-white/20" strokeWidth="1.5" />
      {/* sidebar nav blocks */}
      <rect x="10" y="29" width="7" height="3" rx="1.5" className="fill-violet-400/55" />
      <rect x="10" y="36" width="7" height="3" rx="1.5" className="fill-white/15" />
      <rect x="10" y="43" width="7" height="3" rx="1.5" className="fill-white/15" />
      {/* main pane */}
      <rect x="26" y="29" width="26" height="10" rx="2" className="stroke-white/20" strokeWidth="1.2" />
      <rect x="29.5" y="32.5" width="12" height="3" rx="1.5" className="fill-white/15" />
      <rect x="26" y="44" width="19" height="3" rx="1.5" className="fill-white/15" />
    </svg>
  )
}

function SystemsGlyph() {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" className="h-16 w-16">
      {/* rack units */}
      <rect x="13.75" y="8.75" width="36.5" height="12.5" rx="3" className="stroke-white/30" strokeWidth="1.5" />
      <rect x="13.75" y="25.75" width="36.5" height="12.5" rx="3" className="stroke-white/30" strokeWidth="1.5" />
      <rect x="13.75" y="42.75" width="36.5" height="12.5" rx="3" className="stroke-white/30" strokeWidth="1.5" />
      {/* blinking LEDs */}
      <circle cx="19.5" cy="15" r="1.8" className="animate-blink-caret motion-reduce:animate-none fill-violet-400" />
      <circle
        cx="19.5"
        cy="32"
        r="1.8"
        style={{ animationDelay: '-0.35s' }}
        className="animate-blink-caret motion-reduce:animate-none fill-violet-400"
      />
      <circle
        cx="19.5"
        cy="49"
        r="1.8"
        style={{ animationDelay: '-0.7s' }}
        className="animate-blink-caret motion-reduce:animate-none fill-violet-400"
      />
      {/* vents */}
      <path d="M26 15h16M26 32h16M26 49h16" className="stroke-white/20" strokeWidth="2" strokeLinecap="round" />
      {/* status pips */}
      <circle cx="46" cy="15" r="1.3" className="fill-white/25" />
      <circle cx="46" cy="32" r="1.3" className="fill-white/25" />
      <circle cx="46" cy="49" r="1.3" className="fill-white/25" />
    </svg>
  )
}

function DeviceGlyph({ kind }: { kind: SystemKey }) {
  switch (kind) {
    case 'WEB':
      return <WebGlyph />
    case 'MOBILE':
      return <MobileGlyph />
    case 'DESKTOP':
      return <DesktopGlyph />
    case 'SYSTEMS':
      return <SystemsGlyph />
    default:
      return null
  }
}

/* ------------------------------------------------------------------ */
/* Territory card — glass + hover lift + pointer 3D tilt               */
/* (tilt fully disabled on touch devices & reduced motion)             */
/* ------------------------------------------------------------------ */

function SystemCard({ system, index }: { system: SystemEntry; index: number }) {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const [canHover, setCanHover] = useState(false)

  const rotX = useMotionValue(0)
  const rotY = useMotionValue(0)
  const springX = useSpring(rotX, { stiffness: 200, damping: 22, mass: 0.5 })
  const springY = useSpring(rotY, { stiffness: 200, damping: 22, mass: 0.5 })

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)')
    const sync = () => setCanHover(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  const tiltActive = canHover && !reduced

  function handleMove(e: MouseEvent<HTMLElement>) {
    if (!tiltActive || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    rotY.set(clampTilt(px * MAX_TILT * 2))
    rotX.set(clampTilt(-py * MAX_TILT * 2))
  }

  function handleLeave() {
    rotX.set(0)
    rotY.set(0)
  }

  return (
    <motion.article
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      whileHover={tiltActive ? { y: -4 } : undefined}
      style={{ rotateX: springX, rotateY: springY, transformPerspective: 900 }}
      className={cn(
        'glass group relative flex h-full flex-col overflow-hidden rounded-2xl',
        'transition-[border-color,box-shadow] duration-300',
        tiltActive && 'hover:border-violet-400/40 hover:shadow-[0_14px_60px_-16px_rgba(139,92,246,0.35)]'
      )}
    >
      {/* ------------------ real photography backdrop ------------------ */}
      <div className="relative h-40 overflow-hidden border-b border-white/10 sm:h-48">
        <img
          src={ENGINE_IMAGES[system.key].src}
          alt={ENGINE_IMAGES[system.key].alt}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover opacity-55 saturate-[0.72] transition-all duration-700 group-hover:scale-[1.05] group-hover:opacity-75 group-hover:saturate-100 motion-reduce:transition-none"
        />
        {/* violet duotone + fade into card body */}
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#0a0714] via-[#0a0714]/25 to-transparent" />
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(139,92,246,0.22),transparent_65%)] opacity-70" />

        {/* floating device glyph over the photo */}
        <div
          className="animate-float-slow glass absolute bottom-3 left-4 rounded-2xl p-2.5 motion-reduce:animate-none"
          style={{ animationDelay: `${index * -1.75}s` }}
        >
          <DeviceGlyph kind={system.key} />
        </div>

        {/* live-photo tick */}
        <span className="font-mono-tight absolute right-3 top-3 rounded-full border border-white/15 bg-black/45 px-2.5 py-1 text-[8px] text-zinc-300 backdrop-blur-md">
          FIELD · {String(index + 1).padStart(2, '0')}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <p className="text-lg font-semibold tracking-tight text-zinc-100">{system.key}</p>
          <MonoTag className="pt-1">{system.device}</MonoTag>
        </div>

        <p className="mt-4 leading-snug text-zinc-300">{system.line}</p>

        <div className="mt-auto flex flex-wrap gap-2 pt-7">
          {system.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/10 px-3 py-1 font-mono-tight text-[10px] text-zinc-400"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.article>
  )
}

/* ------------------------------------------------------------------ */
/* ACT 02                                                              */
/* ------------------------------------------------------------------ */

export default function ActEngine() {
  const sectionRef = useRef<HTMLElement>(null)
  const saidRef = useRef(false)
  const entered = useInView(sectionRef, { once: true, margin: '-20% 0px -20% 0px' })

  useEffect(() => {
    if (!entered || saidRef.current) return
    saidRef.current = true
    if (typeof window === 'undefined' || window.innerWidth < 640) return
    const t = window.setTimeout(() => {
      useCompanion.getState().say('Four territories. One engineer.')
    }, 400)
    return () => window.clearTimeout(t)
  }, [entered])

  return (
    <section id="engine" ref={sectionRef} className="relative py-24 sm:py-32 lg:py-40">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <ActHeader
          index="02"
          code="THE ENGINE"
          title={
            <>
              One mind.
              <br />
              Four territories.
            </>
          }
          blurb="I build across the full stack of human-facing software — and the invisible systems underneath them."
        />

        <div className="relative mt-16 sm:mt-24">
          {/* dotted connector behind the grid (lg only, whisper-quiet) */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-1/2 hidden lg:block">
            <div className="mx-auto max-w-3xl border-t border-dashed border-white/[0.07]" />
          </div>

          <div className="relative grid gap-4 sm:gap-6 md:grid-cols-2">
            {SYSTEMS.map((system, i) => (
              <Reveal key={system.key} delay={i * 0.08} className="h-full">
                <SystemCard system={system} index={i} />
              </Reveal>
            ))}
          </div>
        </div>

        {/* status strip */}
        <Reveal delay={0.1} className="mt-14 sm:mt-20">
          <div className="hairline" aria-hidden="true" />
          <div className="mt-6 flex items-center gap-3">
            <span
              aria-hidden="true"
              className="animate-core-pulse motion-reduce:animate-none h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.9)]"
            />
            <MonoTag>STATUS: ALL SYSTEMS OPERATIONAL</MonoTag>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
