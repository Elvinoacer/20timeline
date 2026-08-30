'use client'

/* ------------------------------------------------------------------ */
/* ACT 04 — THE WORK                                                   */
/* Projects told as 5-act stories, one expandable system panel each.   */
/* ------------------------------------------------------------------ */

import { Fragment, useEffect, useRef, useState, type MouseEvent } from 'react'
import { AnimatePresence, motion, useInView, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'
import { ActHeader, EASE_OUT_EXPO, Reveal, useCompanion } from '@/components/portfolio/kit'
import { PROJECTS, PROJECT_GALLERIES, type ProjectStory } from '@/lib/portfolio-data'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

const PIPELINE_NODES = ['FLOOR', 'KITCHEN', 'STOCK', 'PAYMENTS', 'ANALYTICS'] as const

/* ------------------------------------------------------------------ */
/* TiltImage — field photo with pointer 3D tilt + reveal-zoom hover    */
/* ------------------------------------------------------------------ */

function TiltImage({
  src,
  caption,
  index,
  className,
  aspect = 'aspect-[16/10]',
}: {
  src: string
  caption: string
  index: number
  className?: string
  aspect?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const [canHover, setCanHover] = useState(false)

  const rotX = useMotionValue(0)
  const rotY = useMotionValue(0)
  const springX = useSpring(rotX, { stiffness: 220, damping: 24, mass: 0.4 })
  const springY = useSpring(rotY, { stiffness: 220, damping: 24, mass: 0.4 })

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)')
    const sync = () => setCanHover(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  function handleMove(e: MouseEvent<HTMLDivElement>) {
    if (!canHover || reduced || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    rotY.set(px * 7)
    rotX.set(-py * 7)
  }

  function handleLeave() {
    rotX.set(0)
    rotY.set(0)
  }

  return (
    <motion.figure
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ rotateX: springX, rotateY: springY, transformPerspective: 800 }}
      whileHover={canHover && !reduced ? { scale: 1.025, zIndex: 5 } : undefined}
      className={cn('group relative', className)}
    >
      <div className="overflow-hidden rounded-xl border border-white/10 shadow-[0_10px_40px_-18px_rgba(0,0,0,0.8)]">
        <img
          src={src}
          alt={caption}
          loading="lazy"
          decoding="async"
          className={cn(
            aspect,
            'w-full object-cover saturate-[0.8] transition-all duration-700 group-hover:scale-[1.06] group-hover:saturate-100 motion-reduce:transition-none'
          )}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-40"
        />
      </div>
      <figcaption
        aria-hidden
        className="font-mono-tight pointer-events-none absolute bottom-2.5 left-3 right-3 flex items-center justify-between gap-2 text-[8px] text-zinc-300/90"
      >
        <span className="truncate">{caption}</span>
        <span className="shrink-0 text-violet-300/90">{String(index + 1).padStart(2, '0')}</span>
      </figcaption>
    </motion.figure>
  )
}

/* ------------------------------------------------------------------ */
/* ProjectGallery — field footage strip inside an expanded project     */
/* ------------------------------------------------------------------ */

function ProjectGallery({ project }: { project: ProjectStory }) {
  const shots = PROJECT_GALLERIES[project.id] ?? []
  if (shots.length === 0) return null
  return (
    <div className="mt-10">
      <div className="flex items-center gap-4">
        <span className="font-mono-tight text-[10px] text-zinc-600">FIELD FOOTAGE</span>
        <span className="hairline flex-1" aria-hidden />
        <span className="font-mono-tight hidden text-[9px] text-zinc-600 sm:block">
          HOVER FOR PARALLAX
        </span>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {shots.map((shot, i) => (
          <TiltImage
            key={shot.src}
            src={shot.src}
            caption={shot.caption}
            index={i}
            className={cn('motion-reduce:!transform-none', i === 0 && 'sm:col-span-2 lg:col-span-1')}
          />
        ))}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Decorative pipeline strip — only for the first project              */
/* Pure CSS pulse (animate-core-pulse) with staggered animation-delay. */
/* ------------------------------------------------------------------ */

function PipelineStrip() {
  return (
    <div aria-hidden className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-3">
      <span className="font-mono-tight mr-1 text-[10px] text-zinc-600">LIVE PIPELINE</span>
      {PIPELINE_NODES.map((node, i) => (
        <Fragment key={node}>
          <span className="font-mono-tight rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[10px] text-zinc-400">
            {node}
          </span>
          {i < PIPELINE_NODES.length - 1 ? (
            <span className="relative h-px w-6 bg-white/10 sm:w-10">
              <span className="absolute left-1/2 top-1/2 -ml-[3px] -mt-[3px]">
                <span
                  className="animate-core-pulse block h-1.5 w-1.5 rounded-full bg-violet-400 shadow-[0_0_10px_rgba(139,92,246,0.9)]"
                  style={{ animationDelay: `${(i * 1.05).toFixed(2)}s` }}
                />
              </span>
            </span>
          ) : null}
        </Fragment>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* One story act (mono violet label + editorial paragraph)             */
/* ------------------------------------------------------------------ */

function StoryAct({ index, label, text }: { index: number; label: string; text: string }) {
  const reduced = useReducedMotion()
  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: reduced ? 0.01 : 0.6,
        delay: reduced ? 0 : 0.15 + index * 0.05,
        ease: EASE_OUT_EXPO,
      }}
    >
      <p className="font-mono-tight text-[10px] text-violet-400/90">
        <span className="text-zinc-600">{String(index + 1).padStart(2, '0')}</span>
        <span className="mx-2 text-zinc-700">/</span>
        {label}
      </p>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-300 sm:text-[15px]">{text}</p>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/* Project panel — collapsed header always visible, button-only toggle */
/* ------------------------------------------------------------------ */

function ProjectPanel({ project, index }: { project: ProjectStory; index: number }) {
  const [open, setOpen] = useState(index === 0)
  const reduced = useReducedMotion()
  const bodyId = `project-story-${project.id}`
  const anchorId = `project-${project.id}`
  const { toast } = useToast()

  /* ---------------- deep links: #project-<id> ---------------- */
  /* Any hashchange (or boot completion) matching this panel opens it
     and scrolls it into view — links like /#project-fleetflow work.  */
  useEffect(() => {
    const activate = () => {
      if (!window.location.hash.startsWith('#project-')) return
      if (window.location.hash.slice(1) !== anchorId) return
      setOpen((was) => {
        if (!was) window.setTimeout(() => toast({ title: `OPENED ${project.name.toUpperCase()}` }), 400)
        return true
      })
      window.setTimeout(() => {
        document.getElementById(anchorId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 350)
    }
    activate()
    window.addEventListener('hashchange', activate)
    window.addEventListener('eo:booted', activate)
    return () => {
      window.removeEventListener('hashchange', activate)
      window.removeEventListener('eo:booted', activate)
    }
  }, [anchorId])

  const toggle = () => {
    setOpen((v) => {
      const next = !v
      try {
        /* keep the URL shareable without triggering a scroll jump */
        window.history.replaceState(null, '', next ? `#${anchorId}` : window.location.pathname)
      } catch {
        /* history unavailable — the toggle still works */
      }
      return next
    })
  }

  const share = async () => {
    const url = `${window.location.origin}${window.location.pathname}#${anchorId}`
    try {
      if (!navigator.clipboard?.writeText) throw new Error('clipboard unavailable')
      await navigator.clipboard.writeText(url)
      toast({ title: 'SYSTEM LINK COPIED' })
    } catch {
      try {
        const ta = document.createElement('textarea')
        ta.value = url
        ta.setAttribute('readonly', '')
        ta.style.position = 'fixed'
        ta.style.opacity = '0'
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
        toast({ title: 'SYSTEM LINK COPIED' })
      } catch {
        toast({ title: 'COPY FAILED', description: 'Navigate manually: #' + anchorId, variant: 'destructive' })
      }
    }
  }

  return (
    <Reveal delay={index * 0.08}>
      <article
        id={anchorId}
        className="glass group relative scroll-mt-24 overflow-hidden rounded-2xl transition-shadow duration-500 hover:shadow-[0_0_60px_rgba(139,92,246,0.07)]"
      >
        {/* hover ring — separate layer so it survives the .glass cascade */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 rounded-2xl border border-transparent transition-colors duration-500 group-hover:border-violet-400/30"
        />

        {/* collapsed header — intentionally NOT clickable; the button is the toggle */}
        <div className="relative p-6 sm:p-10">
          <div className="grid items-start gap-x-10 gap-y-6 lg:grid-cols-[auto_1fr_auto]">
            <p className="font-mono-tight pt-1.5 text-[10px] leading-none text-zinc-500 lg:pt-2.5">
              PROJECT&nbsp;<span className="text-violet-400/90">{project.num}</span>
            </p>

            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
                <h3 className="text-3xl font-semibold tracking-tight text-zinc-100 sm:text-5xl">
                  {project.name}
                </h3>
                <span className="font-mono-tight text-[10px] text-zinc-500">{project.domain}</span>
                <span className="font-mono-tight text-[10px] text-zinc-500">{project.year}</span>
              </div>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
                {project.tagline}
              </p>
              <ul className="mt-5 flex flex-wrap gap-2" aria-label={`${project.name} tech stack`}>
                {project.stack.map((item) => (
                  <li
                    key={item}
                    className="font-mono-tight rounded-full border border-white/10 px-3 py-1.5 text-[10px] text-zinc-400"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:justify-self-end">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={share}
                  aria-label={`Copy share link to ${project.name}`}
                  title={`Copy share link to ${project.name}`}
                  className="font-mono-tight inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-zinc-500 transition-all duration-300 hover:border-violet-400/50 hover:text-violet-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400"
                >
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
                    <path
                      d="M5 3H3.2A1.7 1.7 0 0 0 1.5 4.7v5.1A1.7 1.7 0 0 0 3.2 11.5h5.1A1.7 1.7 0 0 0 10 9.8V8M7.5 1.5h4v4M11.2 1.8 6 7"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={toggle}
                  aria-expanded={open}
                  aria-controls={bodyId}
                  className={cn(
                    'font-mono-tight inline-flex min-h-[44px] items-center gap-3 rounded-full border px-5 text-[10px] transition-all duration-300',
                    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400',
                    open
                      ? 'border-violet-400/50 bg-violet-500/10 text-violet-200'
                      : 'border-white/15 text-zinc-400 hover:border-violet-400/50 hover:bg-violet-500/10 hover:text-violet-200'
                  )}
                >
                  {open ? 'CLOSE SYSTEM ↑' : 'OPEN THE SYSTEM →'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* expanded body — height/opacity reveal, children stagger 0.05s */}
        <AnimatePresence initial={false}>
          {open ? (
            <motion.div
              key="story"
              id={bodyId}
              role="region"
              aria-label={`${project.name} — the full story`}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: reduced ? 0.01 : 0.7, ease: EASE_OUT_EXPO }}
              className="relative overflow-hidden"
            >
              <div className="px-6 pb-8 sm:px-10 sm:pb-10">
                <div className="hairline" aria-hidden />

                {index === 0 ? <PipelineStrip /> : null}

                <div className="mt-8 grid gap-x-12 gap-y-8 lg:grid-cols-2">
                  <div className="space-y-8">
                    <StoryAct index={0} label="THE PROBLEM" text={project.problem} />
                    <StoryAct index={1} label="THE IDEA" text={project.idea} />
                  </div>
                  <div className="space-y-8">
                    <StoryAct index={2} label="THE EXPERIENCE" text={project.experience} />
                    <StoryAct index={3} label="THE ENGINEERING" text={project.engineering} />
                  </div>
                </div>

                {/* field footage gallery — real photography per project */}
                <ProjectGallery project={project} />

                {/* THE RESULT — full-width blockquote with violet left border */}
                <motion.blockquote
                  initial={reduced ? { opacity: 0 } : { opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: reduced ? 0.01 : 0.6,
                    delay: reduced ? 0 : 0.15 + 4 * 0.05,
                    ease: EASE_OUT_EXPO,
                  }}
                  className="mt-10 border-l-2 border-violet-400/50 pl-5 sm:pl-6"
                >
                  <p className="font-mono-tight text-[10px] text-violet-400/90">
                    <span className="text-zinc-600">05</span>
                    <span className="mx-2 text-zinc-700">/</span>
                    THE RESULT
                  </p>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-300 sm:text-base">
                    {project.result}
                  </p>
                </motion.blockquote>

                {/* metrics row — hairline-separated violet figures */}
                <div className="mt-10 grid grid-cols-1 divide-y divide-white/10 border-y border-white/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                  {project.metrics.map((metric, i) => (
                    <motion.div
                      key={metric.k}
                      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: reduced ? 0.01 : 0.6,
                        delay: reduced ? 0 : 0.15 + (5 + i) * 0.05,
                        ease: EASE_OUT_EXPO,
                      }}
                      className="py-5 sm:px-8 sm:py-6 sm:first:pl-0 sm:last:pr-0"
                    >
                      <p className="text-glow text-3xl font-semibold tracking-tight text-violet-300 sm:text-4xl">
                        {metric.v}
                      </p>
                      <p className="font-mono-tight mt-2 text-[10px] text-zinc-500">{metric.k}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </article>
    </Reveal>
  )
}

/* ------------------------------------------------------------------ */
/* ACT 04 — THE WORK                                                   */
/* ------------------------------------------------------------------ */

export default function ActProjects() {
  const sectionRef = useRef<HTMLElement>(null)
  const inView = useInView(sectionRef, { once: true, margin: '-15% 0px -15% 0px' })
  const saidRef = useRef(false)
  const say = useCompanion((s) => s.say)

  useEffect(() => {
    if (!inView || saidRef.current) return
    if (typeof window !== 'undefined' && window.innerWidth < 640) return
    saidRef.current = true
    say("Don't scroll past Restaurant OS too fast — open it.")
  }, [inView, say])

  return (
    <section id="work" ref={sectionRef} className="relative py-24 sm:py-32 lg:py-40">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <ActHeader
          index="04"
          code="THE WORK"
          title={<>Projects, told as systems.</>}
          blurb="Not screenshots. Each project is the story of a problem that became a working system."
        />

        <div className="mt-14 flex flex-col gap-6 sm:mt-20">
          {PROJECTS.map((project, i) => (
            <ProjectPanel key={project.id} project={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
