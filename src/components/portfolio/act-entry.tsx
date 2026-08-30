'use client'

/* ==========================================================================
   ACT 01 — "THE ENTRY" · The Digital Core
   --------------------------------------------------------------------------
   A 340vh scroll-driven scene. A sticky stage holds the canvas "digital
   core" (breathing violet-white orb + orbiting particles + rotating rings
   + drifting code glyphs) while five narrative beats fade in/out over
   scrollYProgress. rAF pauses when hidden/offscreen; honors reduced motion
   with a single static frame.
   ========================================================================== */

import { Fragment, useEffect, useRef, useState, type ReactNode, type RefObject } from 'react'
import dynamic from 'next/dynamic'
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from 'framer-motion'

import { cn } from '@/lib/utils'
import { EASE_OUT_EXPO, useCompanion } from '@/components/portfolio/kit'
import { webglSupported } from './three/webgl'

/* WebGL hero — client-only, code-split away from the initial bundle */
const CoreScene = dynamic(() => import('./three/core-scene'), { ssr: false })

/* ------------------------------------------------------------------ */
/* constants                                                           */
/* ------------------------------------------------------------------ */

const TAU = Math.PI * 2

const SOFT = '196, 181, 253' // #c4b5fd
const VIOLET = '139, 92, 246' // #8b5cf6
const WHITE = '255, 255, 255'

const GLYPH_STRINGS = ['{ }', '=>', '01', 'fn', '</>', '()', '&&', '::'] as const

type Ring = {
  r: number
  alpha: number
  speed: number
  span: number
  phase: number
  rgb: string
}

const RINGS: Ring[] = [
  { r: 120, alpha: 0.14, speed: 0.1, span: Math.PI * 1.45, phase: 0.4, rgb: SOFT },
  { r: 150, alpha: 0.1, speed: -0.07, span: Math.PI * 0.95, phase: 2.4, rgb: VIOLET },
  { r: 185, alpha: 0.06, speed: 0.045, span: Math.PI * 1.9, phase: 4.6, rgb: SOFT },
]

type Particle = {
  r: number // orbit radius (css px, pre-scale)
  a0: number // initial angle
  speed: number // angular velocity (rad/s, signed)
  ell: number // ellipticity on x
  wa: number // vertical wobble amplitude
  ws: number // vertical wobble speed
  size: number
  a: number // base alpha
  ts: number // twinkle speed
  ph: number // phase
  rgb: string
}

type Glyph = {
  text: string
  x: number
  y0: number // wrap-space y offset
  vy: number // upward drift px/s
  ds: number // horizontal sway speed
  fs: number // flicker speed
  ph: number
  alpha: number
}

const wrap = (v: number, n: number) => ((v % n) + n) % n

/* ------------------------------------------------------------------ */
/* CoreCanvas — the digital core (all state lives inside one effect)   */
/* ------------------------------------------------------------------ */

function CoreCanvas({ sectionRef }: { sectionRef: RefObject<HTMLElement | null> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduced = useReducedMotion() ?? false

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const isFinePointer = window.matchMedia('(pointer: fine)').matches
    const interactive = isFinePointer && !reduced

    /* ---- state (css px space; ctx is DPR-scaled) ---- */
    let w = 0
    let h = 0
    let scale = 1 // composition scale for small viewports
    let baseR = 74 // core radius (css px)

    /* ---- particles: ~200 desktop / 90 mobile ---- */
    const count = window.innerWidth < 640 ? 90 : 200
    const particles: Particle[] = []
    for (let i = 0; i < count; i++) {
      const roll = Math.random()
      particles.push({
        r: 60 + Math.random() * 120,
        a0: Math.random() * TAU,
        speed: (0.1 + Math.random() * 0.42) * (Math.random() < 0.5 ? -1 : 1),
        ell: 0.86 + Math.random() * 0.28,
        wa: 2 + Math.random() * 8,
        ws: 0.3 + Math.random() * 0.8,
        size: 0.6 + Math.random() * 1.6,
        a: 0.3 + Math.random() * 0.55,
        ts: 0.4 + Math.random() * 1.4,
        ph: Math.random() * TAU,
        rgb: roll < 0.08 ? WHITE : roll < 0.2 ? VIOLET : SOFT,
      })
    }

    /* ---- floating code glyphs ---- */
    const glyphs: Glyph[] = []
    for (let i = 0; i < 14; i++) {
      glyphs.push({
        text: GLYPH_STRINGS[i % GLYPH_STRINGS.length] ?? '01',
        x: 0,
        y0: 0,
        vy: 3 + Math.random() * 5,
        ds: 0.2 + Math.random() * 0.4,
        fs: 0.3 + Math.random() * 0.6,
        ph: Math.random() * TAU,
        alpha: 0.1 + Math.random() * 0.07,
      })
    }

    const scatterGlyphs = () => {
      for (const g of glyphs) {
        const ang = Math.random() * TAU
        const rad = (120 + Math.random() * 180) * scale
        g.x = w / 2 + Math.cos(ang) * rad
        g.y0 = Math.random() * (h + 80)
      }
    }

    /* ---- pointer (fine pointers only) ---- */
    const pointer = { x: 0, y: 0, active: false } // target
    const mouse = { x: 0, y: 0, s: 0 } // lerped + smoothed strength

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      pointer.x = e.clientX - rect.left - rect.width / 2
      pointer.y = e.clientY - rect.top - rect.height / 2
      pointer.active = true
    }
    const onPointerLeave = () => {
      pointer.active = false
    }

    /* ---- render one frame at time t (seconds) ---- */
    const draw = (t: number) => {
      if (w === 0 || h === 0) return
      ctx.clearRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'lighter'

      // touch devices: autonomous slow drift of the whole system
      const cx = w / 2 + (interactive ? 0 : Math.sin(t * 0.26) * 7)
      const cy = h / 2 + (interactive ? 0 : Math.cos(t * 0.19) * 5)

      // rotating ring arcs
      ctx.lineWidth = 1
      for (const ring of RINGS) {
        const start = t * ring.speed + ring.phase
        ctx.strokeStyle = `rgba(${ring.rgb},${ring.alpha})`
        ctx.beginPath()
        ctx.arc(cx, cy, ring.r * scale, start, start + ring.span)
        ctx.stroke()
      }

      // code glyphs drifting upward
      ctx.font = '10px monospace'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      const spanY = h + 80
      for (const g of glyphs) {
        const gx = g.x + Math.sin(t * g.ds + g.ph) * 8
        const gy = wrap(g.y0 - t * g.vy, spanY) - 40
        const ga = g.alpha * (0.72 + 0.28 * Math.sin(t * g.fs + g.ph))
        ctx.fillStyle = `rgba(${SOFT},${ga})`
        ctx.fillText(g.text, gx, gy)
      }

      // orbiting particles (additive glow)
      const influence = 200 * scale
      for (const p of particles) {
        const ang = p.a0 + t * p.speed
        const rad = p.r * scale
        let x = cx + Math.cos(ang) * rad * p.ell
        let y = cy + Math.sin(ang) * rad + Math.sin(t * p.ws + p.ph) * p.wa
        if (mouse.s > 0.01) {
          const dx = mouse.x - x
          const dy = mouse.y - y
          const d = Math.hypot(dx, dy)
          if (d < influence && d > 0.001) {
            const f = 1 - d / influence
            const pull = f * f * 0.35 * mouse.s // gentle, stable displacement
            x += dx * pull
            y += dy * pull
          }
        }
        const tw = 0.55 + 0.45 * Math.sin(t * p.ts * 2 + p.ph)
        ctx.fillStyle = `rgba(${p.rgb},${p.a * tw})`
        ctx.beginPath()
        ctx.arc(x, y, p.size, 0, TAU)
        ctx.fill()
      }

      // the core: breathing orb with violet glow
      const breath = 1 + 0.03 * (Math.sin(t * 0.85) * 0.5 + 0.5) // 1 → 1.06
      const R = baseR * breath
      const near = interactive ? Math.max(0, 1 - Math.hypot(mouse.x, mouse.y) / 150) : 0
      const glow = 1 + near * 0.55

      const haloR = Math.min(R * 3.2, Math.min(w, h) / 2 - 6) // never clip at canvas edge
      const halo = ctx.createRadialGradient(cx, cy, R * 0.25, cx, cy, haloR)
      halo.addColorStop(0, `rgba(${VIOLET},${0.42 * glow})`)
      halo.addColorStop(0.45, `rgba(${VIOLET},${0.13 * glow})`)
      halo.addColorStop(1, `rgba(${VIOLET},0)`)
      ctx.fillStyle = halo
      ctx.beginPath()
      ctx.arc(cx, cy, haloR, 0, TAU)
      ctx.fill()

      ctx.save()
      ctx.shadowColor = `rgba(${VIOLET},0.9)`
      ctx.shadowBlur = (34 + 26 * ((breath - 1) / 0.03)) * glow
      const hot = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.4)
      hot.addColorStop(0, 'rgba(255,255,255,0.95)')
      hot.addColorStop(0.16, 'rgba(230,222,255,0.82)')
      hot.addColorStop(0.5, `rgba(${VIOLET},0.36)`)
      hot.addColorStop(1, `rgba(${VIOLET},0)`)
      ctx.fillStyle = hot
      ctx.beginPath()
      ctx.arc(cx, cy, R * 1.4, 0, TAU)
      ctx.fill()
      ctx.restore()
    }

    /* ---- resize (DPR-aware, capped at 2) ---- */
    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      w = Math.max(1, rect.width)
      h = Math.max(1, rect.height)
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      scale = Math.min(1, Math.max(0.62, Math.min(w, h) / 460))
      baseR = Math.min(92, Math.max(58, Math.min(w, h) * 0.115))
      scatterGlyphs()
      if (reduced) draw(0) // reduced motion → single static frame
    }

    /* ---- rAF loop with pause/resume ---- */
    let raf = 0
    let running = false
    let inView = false
    let docVisible = true
    let t = 0
    let last: number | null = null

    const frame = (now: number) => {
      if (last !== null) t += Math.min((now - last) / 1000, 0.05)
      last = now
      if (interactive) {
        mouse.x += (pointer.x - mouse.x) * 0.075
        mouse.y += (pointer.y - mouse.y) * 0.075
        mouse.s += ((pointer.active ? 1 : 0) - mouse.s) * 0.06
      }
      draw(t)
      raf = requestAnimationFrame(frame)
    }

    const sync = () => {
      const should = !reduced && inView && docVisible
      if (should && !running) {
        running = true
        last = null
        raf = requestAnimationFrame(frame)
      } else if (!should && running) {
        running = false
        cancelAnimationFrame(raf)
      }
    }

    const onVisibility = () => {
      docVisible = !document.hidden
      sync()
    }

    const io = new IntersectionObserver(
      (entries) => {
        inView = entries[0]?.isIntersecting ?? false
        sync()
      },
      { threshold: 0 }
    )
    if (sectionRef.current) io.observe(sectionRef.current)

    document.addEventListener('visibilitychange', onVisibility)
    if (interactive) {
      window.addEventListener('pointermove', onPointerMove, { passive: true })
      document.documentElement.addEventListener('mouseleave', onPointerLeave)
      window.addEventListener('blur', onPointerLeave)
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    /* ---- cleanup: no leaks ---- */
    return () => {
      running = false
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pointermove', onPointerMove)
      document.documentElement.removeEventListener('mouseleave', onPointerLeave)
      window.removeEventListener('blur', onPointerLeave)
    }
  }, [reduced, sectionRef])

  return (
    <canvas
      ref={canvasRef}
      role="presentation"
      aria-hidden="true"
      className="h-[80vmin] max-h-full w-[80vmin] max-w-full"
    />
  )
}

/* ------------------------------------------------------------------ */
/* Beat — absolutely centered narrative layer driven by scroll         */
/* ------------------------------------------------------------------ */

function Beat({
  opacity,
  y,
  children,
}: {
  opacity: MotionValue<number>
  y: MotionValue<number>
  children: ReactNode
}) {
  return (
    <motion.div
      style={{ opacity, y }}
      className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 text-center"
    >
      <div className={cn('w-full max-w-3xl [text-shadow:0_2px_28px_rgba(5,5,5,0.95),0_0_80px_rgba(5,5,5,0.8)]')}>{children}</div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/* ActEntry — ACT 01                                                   */
/* ------------------------------------------------------------------ */

export default function ActEntry({ booted }: { booted: boolean }) {
  const sectionRef = useRef<HTMLElement>(null)
  const reduced = useReducedMotion() ?? false

  /* WebGL digital core (falls back to the Canvas2D orb when unavailable) */
  const [use3D, setUse3D] = useState(false)
  const [coreInView, setCoreInView] = useState(true)
  useEffect(() => {
    setUse3D(webglSupported())
  }, [])
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => setCoreInView(!!entry?.isIntersecting), {
      threshold: 0,
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })

  /* narrative beats — non-overlapping ranges (non-overlap-safe clamps) */
  const beat1Opacity = useTransform(scrollYProgress, [0, 0.16, 0.2], [1, 1, 0])
  const beat1Y = useTransform(scrollYProgress, [0.12, 0.2], [0, -36])

  const beat2Opacity = useTransform(scrollYProgress, [0.22, 0.27, 0.38, 0.42], [0, 1, 1, 0])
  const beat2Y = useTransform(scrollYProgress, [0.22, 0.3, 0.38, 0.44], [36, 0, 0, -36])

  const beat3Opacity = useTransform(scrollYProgress, [0.44, 0.49, 0.58, 0.62], [0, 1, 1, 0])
  const beat3Y = useTransform(scrollYProgress, [0.44, 0.52, 0.58, 0.64], [36, 0, 0, -36])

  const beat4Opacity = useTransform(scrollYProgress, [0.62, 0.67, 0.78, 0.82], [0, 1, 1, 0])
  const beat4Y = useTransform(scrollYProgress, [0.62, 0.7, 0.78, 0.84], [36, 0, 0, -36])

  const beat5Opacity = useTransform(scrollYProgress, [0.82, 0.9], [0, 1])
  const beat5Y = useTransform(scrollYProgress, [0.82, 0.95], [56, 0])

  /* core visual evolution: 0.85 → 1.12, dimmed during text beats */
  const coreScale = useTransform(scrollYProgress, [0, 0.8], [0.85, 1.12])
  const coreDim = useTransform(scrollYProgress, [0, 0.04, 0.2, 0.8, 1], [1, 0.4, 0.4, 1, 1])

  /* scroll cue: visible only while the entry act owns the viewport.
     Driven by a plain scroll listener (state, not a MotionValue) so it
     can never get stranded visible — even under rAF starvation. */
  const [cueVisible, setCueVisible] = useState(true)
  useEffect(() => {
    const onScroll = () => setCueVisible(window.scrollY < window.innerHeight * 0.5)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* EO-7 companion greeting — once, after boot, ≥640px only */
  const greeted = useRef(false)
  useEffect(() => {
    if (!booted || window.innerWidth < 640) return
    const id = window.setTimeout(() => {
      if (greeted.current) return
      greeted.current = true
      useCompanion.getState().say("Hey. You found the core. Scroll — I'll show you around.")
    }, 1800)
    return () => window.clearTimeout(id)
  }, [booted])

  return (
    <section
      id="entry"
      ref={sectionRef}
      aria-label="Introduction — Elvin Omondi, Software Engineer"
      className="relative h-[340vh]"
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* background layers */}
        <div aria-hidden className="grid-bg absolute inset-0" />
        <div aria-hidden className="noise-bg" />
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_50%_50%,rgba(139,92,246,0.16),transparent_70%)]"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_52%,rgba(5,5,5,0.72)_100%)]"
        />

        {/* the digital core — WebGL PBR scene, Canvas2D fallback */}
        <motion.div
          aria-hidden
          style={{ scale: coreScale, opacity: coreDim }}
          className="absolute inset-0 flex items-center justify-center"
        >
          {use3D && !reduced ? <CoreScene active={coreInView} /> : <CoreCanvas sectionRef={sectionRef} />}
        </motion.div>

        {/* narrative beats — gated on boot */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: booted ? 1 : 0 }}
          transition={{ duration: 1, ease: EASE_OUT_EXPO }}
          className="absolute inset-0"
        >
          {/* beat 1 · p 0.00–0.20 */}
          <Beat opacity={beat1Opacity} y={beat1Y}>
            <div className="flex items-center justify-center gap-2.5">
              <span aria-hidden className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-60 motion-reduce:animate-none" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-400" />
              </span>
              <span className="font-mono-tight text-[11px] text-violet-300">System Online</span>
            </div>
            <p className="mt-6 text-balance text-3xl font-semibold leading-[1.08] tracking-tight text-zinc-100 sm:text-5xl">
              I build software that moves ideas into the real world.
            </p>
          </Beat>

          {/* beat 2 · p 0.22–0.42 */}
          <Beat opacity={beat2Opacity} y={beat2Y}>
            <p className="text-balance text-2xl font-medium tracking-tight text-zinc-300 sm:text-4xl">
              An idea starts as nothing.
            </p>
          </Beat>

          {/* beat 3 · p 0.44–0.62 */}
          <Beat opacity={beat3Opacity} y={beat3Y}>
            <p className="text-balance text-2xl font-medium tracking-tight text-zinc-300 sm:text-4xl">
              Then someone decides to build it.
            </p>
          </Beat>

          {/* beat 4 · p 0.62–0.82 */}
          <Beat opacity={beat4Opacity} y={beat4Y}>
            <p className="text-balance text-2xl font-medium tracking-tight text-zinc-300 sm:text-4xl">
              That&rsquo;s where <span className="text-glow text-violet-400">I</span> come in.
            </p>
          </Beat>

          {/* beat 5 · p 0.84–1.0 — identity reveal, stays visible */}
          <Beat opacity={beat5Opacity} y={beat5Y}>
            <p className="font-mono-tight text-[10px] text-violet-300/90 sm:text-xs">
              Software Engineer · Product Builder · Creative Developer
            </p>
            <h1 className="mt-6 bg-gradient-to-b from-white via-zinc-100 to-zinc-400 bg-clip-text text-5xl font-semibold tracking-tight text-transparent sm:text-7xl lg:text-8xl">
              ELVIN OMONDI
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-balance text-base leading-relaxed text-zinc-400 sm:text-lg">
              I design and engineer digital products for the web, mobile, desktop and beyond.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-2.5">
              {['Web', 'Mobile', 'Desktop', 'Systems'].map((chip, i) => (
                <Fragment key={chip}>
                  {i > 0 ? <span aria-hidden className="h-1 w-1 rounded-full bg-violet-400" /> : null}
                  <span className="font-mono-tight rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-[10px] text-zinc-400">
                    {chip}
                  </span>
                </Fragment>
              ))}
            </div>
            <a
              href="#engine"
              className="pointer-events-auto mt-10 inline-flex min-h-[44px] items-center gap-2 px-1 font-mono-tight text-[10px] text-zinc-500 transition-colors duration-300 hover:text-violet-300"
            >
              Begin Transmission <span aria-hidden>↓</span>
            </a>
          </Beat>
        </motion.div>

        {/* scroll cue — entry act only */}
        <motion.div
          animate={{ opacity: cueVisible ? 1 : 0 }}
          transition={{ duration: 0.45, ease: EASE_OUT_EXPO }}
          aria-hidden
          className="pointer-events-none fixed bottom-10 left-1/2 z-20 -translate-x-1/2"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: booted ? 1 : 0 }}
            transition={{ duration: 0.9, delay: 0.4, ease: EASE_OUT_EXPO }}
            className="flex flex-col items-center gap-3"
          >
            <span className="font-mono-tight text-[10px] text-zinc-500">Scroll to Explore</span>
            <motion.span
              animate={reduced ? undefined : { y: [0, 7, 0] }}
              transition={reduced ? undefined : { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              className="text-sm text-violet-300"
            >
              ↓
            </motion.span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
