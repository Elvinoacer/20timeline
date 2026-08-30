'use client'

/* ------------------------------------------------------------------ */
/* ACT 03 — THE PIPELINE                                               */
/* Vertical journey through the 5 PIPELINE steps with a scroll-drawn   */
/* violet track, per-step node glow, underline sweeps and an EO-7      */
/* companion beat.                                                     */
/* ------------------------------------------------------------------ */

import { useEffect, useRef } from 'react'
import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useSpring,
} from 'framer-motion'

import { ActHeader, EASE_OUT_EXPO, MonoTag, Reveal, useCompanion } from '@/components/portfolio/kit'
import { PIPELINE } from '@/lib/portfolio-data'
import { cn } from '@/lib/utils'

type PipelineEntry = (typeof PIPELINE)[number]

/* ------------------------------------------------------------------ */
/* Track node — 12px violet dot, glows while the step is in view       */
/* ------------------------------------------------------------------ */

function StepNode({ active }: { active: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'absolute top-1.5 left-4 z-10 h-3 w-3 -translate-x-1/2 rounded-full border transition-all duration-700 md:left-1/2',
        active
          ? 'border-violet-300/70 bg-violet-400 shadow-[0_0_18px_rgba(139,92,246,0.95)]'
          : 'border-white/20 bg-[#050505]'
      )}
    />
  )
}

/* ------------------------------------------------------------------ */
/* Single pipeline step                                                */
/* ------------------------------------------------------------------ */

function PipelineItem({ item, index }: { item: PipelineEntry; index: number }) {
  const ref = useRef<HTMLLIElement>(null)
  const active = useInView(ref, { once: true, margin: '-18% 0px -18% 0px' })
  const reduced = useReducedMotion()

  const isFinal = index === PIPELINE.length - 1
  const leftSide = index % 2 === 1

  return (
    <li ref={ref} className="relative pl-12 md:grid md:grid-cols-2 md:gap-x-20 md:pl-0">
      <StepNode active={active} />

      <Reveal y={28} className={cn(leftSide ? 'md:col-start-1' : 'md:col-start-2')}>
        {/* hairline separator — typography carries the card */}
        <div className="hairline max-w-md" aria-hidden="true" />

        <p className="mt-6 font-mono-tight text-[10px] text-zinc-500">STEP {item.step}</p>

        <h3 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-100 sm:text-4xl">
          <span className="relative inline-block">
            <span className={cn(isFinal && 'text-glow text-violet-200')}>{item.key}</span>
            <motion.span
              aria-hidden="true"
              initial={{ scaleX: reduced ? 1 : 0 }}
              animate={{ scaleX: 1 }}
              transition={reduced ? { duration: 0 } : { duration: 0.7, delay: 0.15, ease: EASE_OUT_EXPO }}
              className="absolute -bottom-2 left-0 h-[2px] w-full origin-left bg-violet-400/80 shadow-[0_0_12px_rgba(139,92,246,0.6)]"
            />
          </span>
        </h3>

        <p className="mt-3 text-lg text-zinc-300">{item.line}</p>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-zinc-500">{item.detail}</p>

        {isFinal && (
          <div className="mt-8 flex items-center gap-4">
            {/* infinity-like rotating dashed loop */}
            <svg
              viewBox="0 0 40 40"
              fill="none"
              aria-hidden="true"
              className="animate-spin-slow motion-reduce:animate-none h-10 w-10 shrink-0"
            >
              <circle
                cx="20"
                cy="20"
                r="16"
                stroke="rgba(139,92,246,0.45)"
                strokeWidth="1.25"
                strokeDasharray="4 6"
                strokeLinecap="round"
              />
              <circle cx="20" cy="4" r="2.1" fill="#8b5cf6" />
            </svg>
            <MonoTag>→ output becomes the next input. Systems compound.</MonoTag>
          </div>
        )}
      </Reveal>
    </li>
  )
}

/* ------------------------------------------------------------------ */
/* ACT 03                                                              */
/* ------------------------------------------------------------------ */

export default function ActPipeline() {
  const sectionRef = useRef<HTMLElement>(null)
  const saidRef = useRef(false)
  const entered = useInView(sectionRef, { once: true, margin: '-20% 0px -20% 0px' })

  /* scroll-drawn track: 0 when section start hits 70% viewport,
     1 when section end reaches 60% viewport */
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start 0.7', 'end 0.6'] })
  const draw = useSpring(scrollYProgress, { stiffness: 110, damping: 30, mass: 0.4 })

  useEffect(() => {
    if (!entered || saidRef.current) return
    saidRef.current = true
    if (typeof window === 'undefined' || window.innerWidth < 640) return
    const t = window.setTimeout(() => {
      useCompanion.getState().say('This is how ideas survive contact with reality.')
    }, 400)
    return () => window.clearTimeout(t)
  }, [entered])

  return (
    <section id="process" ref={sectionRef} className="relative py-24 sm:py-32 lg:py-40">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <ActHeader
          index="03"
          code="THE PIPELINE"
          title={<>I don&rsquo;t just write code.</>}
          blurb="Every project I take runs through the same pipeline. It's how an idea survives contact with reality."
        />

        <div className="relative mt-16 sm:mt-24">
          {/* base track */}
          <div
            aria-hidden="true"
            className="absolute top-0 bottom-0 left-4 w-px bg-white/10 md:left-1/2 md:-translate-x-1/2"
          />
          {/* scroll-drawn violet overlay */}
          <motion.div
            aria-hidden="true"
            style={{ scaleY: draw }}
            className="absolute top-0 bottom-0 left-4 w-px origin-top bg-gradient-to-b from-violet-300 via-violet-500 to-violet-400/20 shadow-[0_0_16px_rgba(139,92,246,0.25)] md:left-1/2 md:-translate-x-1/2"
          />

          <ol className="relative space-y-16 sm:space-y-24">
            {PIPELINE.map((item, i) => (
              <PipelineItem key={item.step} item={item} index={i} />
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
