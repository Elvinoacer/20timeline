'use client'

/* ------------------------------------------------------------------ */
/* ACT 05 — THE LAB                                                    */
/* Four interactive experiments. Every rAF / listener / observer is    */
/* cleaned up on unmount; per-frame work is transform- or canvas-only. */
/* ------------------------------------------------------------------ */

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import dynamic from 'next/dynamic'
import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion'
import { ActHeader, EASE_OUT_EXPO, Reveal, useCompanion } from '@/components/portfolio/kit'
import { cn } from '@/lib/utils'
import { webglSupported } from './three/webgl'

/* Real-asset model viewer — client-only, code-split */
const ModelViewer = dynamic(() => import('./three/model-viewer'), { ssr: false })

/* ------------------------------------------------------------------ */
/* Shared card shell + mono toggle button                              */
/* ------------------------------------------------------------------ */

function ExperimentCard({
  code,
  title,
  instruction,
  control,
  stageClassName,
  children,
}: {
  code: string
  title: string
  instruction: string
  control?: ReactNode
  stageClassName?: string
  children: ReactNode
}) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3 p-5 sm:p-6">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-mono-tight text-[10px] text-violet-400/90">{code}</span>
            <h3 className="text-lg font-semibold tracking-tight text-zinc-100">{title}</h3>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">{instruction}</p>
        </div>
        {control ? <div className="shrink-0">{control}</div> : null}
      </div>
      <div
        className={cn(
          'relative h-64 overflow-hidden border-t border-white/10 bg-[#070707] sm:h-72',
          stageClassName
        )}
      >
        {children}
      </div>
    </div>
  )
}

function LabToggle({
  active,
  onClick,
  disabled,
  ariaLabel,
  children,
}: {
  active?: boolean
  onClick?: () => void
  disabled?: boolean
  ariaLabel?: string
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-pressed={active}
      className={cn(
        'font-mono-tight inline-flex min-h-[44px] items-center rounded-full border px-4 text-[10px] transition-all duration-300',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400',
        'disabled:cursor-not-allowed disabled:opacity-50',
        active
          ? 'border-violet-400/50 bg-violet-500/10 text-violet-200'
          : 'border-white/15 text-zinc-400 hover:border-violet-400/50 hover:bg-violet-500/10 hover:text-violet-200'
      )}
    >
      {children}
    </button>
  )
}

/* ------------------------------------------------------------------ */
/* EXP-01 — PARTICLE FIELD                                             */
/* Canvas, DPR cap 2, 70 particles (30 < 640px). Pointer attraction    */
/* within 140px, lerped velocity; autonomous drift after 3s idle.      */
/* ------------------------------------------------------------------ */

type Particle = { x: number; y: number; vx: number; vy: number; r: number; tint: number }

function ParticleExperiment() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const pointer = { x: 0, y: 0, ts: -1e9 }
    let width = 0
    let height = 0
    let particles: Particle[] = []
    let targetCount = -1
    let raf = 0
    let running = false
    let inView = true

    const build = () => {
      particles = Array.from({ length: targetCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: 0.6 + Math.random() * 0.55,
        tint: Math.random(),
      }))
    }

    const drawDot = (p: Particle) => {
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      ctx.fillStyle = p.tint > 0.6 ? 'rgba(139, 92, 246, 0.9)' : 'rgba(244, 244, 245, 0.7)'
      ctx.fill()
    }

    const drawStatic = () => {
      ctx.clearRect(0, 0, width, height)
      ctx.globalCompositeOperation = 'lighter'
      for (const p of particles) drawDot(p)
      ctx.globalCompositeOperation = 'source-over'
    }

    const resize = () => {
      width = canvas.clientWidth
      height = canvas.clientHeight
      if (width === 0 || height === 0) return
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const next = width < 640 ? 30 : 70
      if (next !== targetCount) {
        targetCount = next
        build()
      }
      if (reduced) drawStatic()
    }

    const step = () => {
      if (!running) return
      const pointerLive = performance.now() - pointer.ts < 3000
      ctx.clearRect(0, 0, width, height)
      ctx.globalCompositeOperation = 'lighter'
      for (const p of particles) {
        // ambient wander
        p.vx += (Math.random() - 0.5) * 0.014
        p.vy += (Math.random() - 0.5) * 0.014
        // gentle attraction toward pointer inside 140px radius
        if (pointerLive) {
          const dx = pointer.x - p.x
          const dy = pointer.y - p.y
          const dist = Math.hypot(dx, dy) || 1
          if (dist < 140) {
            const pull = (1 - dist / 140) * 0.05
            p.vx += (dx / dist) * pull
            p.vy += (dy / dist) * pull
          }
        }
        // lerp back toward calm drift
        p.vx *= 0.96
        p.vy *= 0.96
        const sp = Math.hypot(p.vx, p.vy)
        if (sp > 1.3) {
          p.vx = (p.vx / sp) * 1.3
          p.vy = (p.vy / sp) * 1.3
        }
        p.x += p.vx
        p.y += p.vy
        if (p.x < -4) p.x = width + 4
        else if (p.x > width + 4) p.x = -4
        if (p.y < -4) p.y = height + 4
        else if (p.y > height + 4) p.y = -4
        drawDot(p)
      }
      ctx.globalCompositeOperation = 'source-over'
      raf = requestAnimationFrame(step)
    }

    const start = () => {
      if (running || reduced || !inView) return
      running = true
      raf = requestAnimationFrame(step)
    }
    const stop = () => {
      running = false
      cancelAnimationFrame(raf)
    }

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      pointer.x = e.clientX - rect.left
      pointer.y = e.clientY - rect.top
      pointer.ts = performance.now()
    }

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          inView = entry.isIntersecting
          if (inView) start()
          else stop()
        }
      },
      { rootMargin: '120px' }
    )
    io.observe(canvas)
    canvas.addEventListener('pointermove', onPointerMove)

    resize()
    if (reduced) drawStatic()
    else start()

    return () => {
      stop()
      ro.disconnect()
      io.disconnect()
      canvas.removeEventListener('pointermove', onPointerMove)
    }
  }, [reduced])

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />
}

/* ------------------------------------------------------------------ */
/* EXP-02 — GRAVITY                                                    */
/* 12 chips float in a loose orbit; GRAVITY: ON springs them into a    */
/* pile at the bottom (stiffness 200 / damping 14, 40ms stagger).      */
/* ------------------------------------------------------------------ */

const GRAVITY_WORDS = [
  'TypeScript', 'React', 'PostgreSQL', 'Docker',
  'Redis', 'Flutter', 'Prisma', 'Node.js',
  'Next.js', 'Tailwind', 'WebSocket', 'Zustand',
]

/* predefined pseudo-random orbit cloud: x%, y%, base rotation, float duration */
const ORBIT_SPOTS = [
  { x: 5, y: 10, r: -8, d: 4.4 },
  { x: 27, y: 5, r: 6, d: 5.2 },
  { x: 49, y: 13, r: -4, d: 3.9 },
  { x: 70, y: 6, r: 10, d: 4.7 },
  { x: 12, y: 38, r: 5, d: 5.5 },
  { x: 34, y: 33, r: -9, d: 4.1 },
  { x: 57, y: 40, r: 7, d: 4.9 },
  { x: 76, y: 34, r: -5, d: 4.3 },
  { x: 7, y: 66, r: 8, d: 5.1 },
  { x: 30, y: 62, r: -6, d: 4.0 },
  { x: 53, y: 68, r: 9, d: 4.6 },
  { x: 73, y: 62, r: -10, d: 4.2 },
]

/* pile targets: two stacked rows near the floor with settled rotations */
const PILE_SPOTS = [
  { x: 3, y: 80, r: -14 },
  { x: 15, y: 84, r: 11 },
  { x: 27, y: 78, r: -7 },
  { x: 39, y: 85, r: 13 },
  { x: 51, y: 79, r: -12 },
  { x: 63, y: 84, r: 9 },
  { x: 74, y: 78, r: -15 },
  { x: 9, y: 58, r: 15 },
  { x: 22, y: 54, r: -10 },
  { x: 35, y: 57, r: 6 },
  { x: 48, y: 53, r: -16 },
  { x: 61, y: 56, r: 12 },
]

function GravityExperiment() {
  const [gravity, setGravity] = useState(false)
  const [size, setSize] = useState({ w: 0, h: 0 })
  const stageRef = useRef<HTMLDivElement | null>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const el = stageRef.current
    if (!el) return
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <ExperimentCard
      code="EXP-02"
      title="GRAVITY"
      instruction="Flip gravity. Watch the stack fall."
      control={
        <LabToggle active={gravity} onClick={() => setGravity((v) => !v)} ariaLabel="Toggle gravity">
          GRAVITY: {gravity ? 'ON' : 'OFF'}
        </LabToggle>
      }
    >
      <div ref={stageRef} className="absolute inset-0" aria-hidden>
        {GRAVITY_WORDS.map((word, i) => {
          const orbit = ORBIT_SPOTS[i]
          const pile = PILE_SPOTS[i]
          const dx = gravity ? ((pile.x - orbit.x) / 100) * size.w : 0
          const dy = gravity ? ((pile.y - orbit.y) / 100) * size.h : 0
          return (
            <motion.span
              key={word}
              className={cn(
                'font-mono-tight absolute whitespace-nowrap rounded-full border px-3 py-1.5 text-[10px] transition-colors duration-300',
                gravity
                  ? 'border-violet-400/40 bg-violet-500/10 text-violet-200'
                  : 'border-white/10 bg-white/[0.04] text-zinc-300'
              )}
              style={{ left: `${orbit.x}%`, top: `${orbit.y}%` }}
              initial={false}
              animate={{ x: dx, y: dy, rotate: gravity ? pile.r : orbit.r }}
              transition={
                reduced
                  ? { duration: 0 }
                  : gravity
                    ? { type: 'spring', stiffness: 200, damping: 14, delay: i * 0.04 }
                    : { duration: 0.9, ease: EASE_OUT_EXPO, delay: i * 0.03 }
              }
            >
              {/* inner loop only while floating; killed the moment gravity flips */}
              <motion.span
                className="block"
                animate={reduced || gravity ? { y: 0 } : { y: [-6, 6] }}
                transition={
                  reduced
                    ? { duration: 0 }
                    : gravity
                      ? { duration: 0.15 }
                      : { duration: orbit.d, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut', delay: i * 0.2 }
                }
              >
                {word}
              </motion.span>
            </motion.span>
          )
        })}
      </div>
    </ExperimentCard>
  )
}

/* ------------------------------------------------------------------ */
/* EXP-03 — BREAK IT                                                   */
/* The mock UI is 12 absolutely-positioned fragments. On crash each    */
/* gets a random velocity + angular velocity and is integrated in a    */
/* single rAF loop: gravity 900 px/s², floor/wall bounce dampened,     */
/* friction on ground, fade to 0.5. RESTORE lerps every fragment back  */
/* to its origin transform. Repeatable forever; rAF fully cleaned up.  */
/* ------------------------------------------------------------------ */

type FragmentDef = { id: string; className: string; style: CSSProperties; label?: string }

const UI_FRAGMENTS: FragmentDef[] = [
  { id: 'titlebar', className: 'border-b border-white/10 bg-white/[0.05]', style: { left: '0%', top: '0%', width: '100%', height: '13%' } },
  { id: 'dot-a', className: 'rounded-full bg-zinc-600', style: { left: '4%', top: '5%', width: '9px', height: '9px' } },
  { id: 'dot-b', className: 'rounded-full bg-zinc-600', style: { left: '7.5%', top: '5%', width: '9px', height: '9px' } },
  { id: 'dot-c', className: 'rounded-full bg-zinc-600', style: { left: '11%', top: '5%', width: '9px', height: '9px' } },
  { id: 'title', className: 'font-mono-tight text-[10px] leading-none text-zinc-500', style: { left: '38%', top: '6%' }, label: 'production.app' },
  { id: 'sidebar', className: 'border-r border-white/10 bg-white/[0.02]', style: { left: '0%', top: '13%', width: '26%', height: '87%' } },
  { id: 'sb-1', className: 'rounded-sm bg-white/10', style: { left: '4.5%', top: '20%', width: '14%', height: '3%' } },
  { id: 'sb-2', className: 'rounded-sm bg-white/10', style: { left: '4.5%', top: '28%', width: '11%', height: '3%' } },
  { id: 'sb-3', className: 'rounded-sm bg-white/[0.07]', style: { left: '4.5%', top: '36%', width: '15%', height: '3%' } },
  { id: 'line-1', className: 'rounded-sm bg-white/10', style: { left: '32%', top: '22%', width: '50%', height: '3.2%' } },
  { id: 'line-2', className: 'rounded-sm bg-white/[0.07]', style: { left: '32%', top: '31%', width: '38%', height: '3.2%' } },
  { id: 'cta', className: 'font-mono-tight flex items-center justify-center rounded-lg border border-violet-400/40 bg-violet-500/20 text-[9px] text-violet-200', style: { left: '32%', top: '44%', width: '24%', height: '9%' }, label: 'DEPLOY' },
]

type FragPhysics = {
  x: number
  y: number
  vx: number
  vy: number
  rot: number
  vr: number
  minX: number
  maxX: number
  minY: number
  maxY: number
  asleep: boolean
}

type CrashMode = 'idle' | 'crashed' | 'restoring'

function BreakExperiment() {
  const stageRef = useRef<HTMLDivElement | null>(null)
  const fragRefs = useRef<(HTMLDivElement | null)[]>([])
  const physicsRef = useRef<(FragPhysics | null)[] | null>(null)
  const rafRef = useRef(0)
  const modeRef = useRef<CrashMode>('idle')
  const finePointerRef = useRef(false)
  const [mode, setMode] = useState<CrashMode>('idle')
  const reduced = useReducedMotion()

  const setBoth = useCallback((m: CrashMode) => {
    modeRef.current = m
    setMode(m)
  }, [])

  useEffect(() => {
    finePointerRef.current = window.matchMedia('(pointer: fine)').matches
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  const crash = () => {
    if (modeRef.current !== 'idle') return
    const stage = stageRef.current
    if (!stage) return
    setBoth('crashed')

    if (reduced) {
      for (const el of fragRefs.current) if (el) el.style.opacity = '0.5'
      physicsRef.current = null
      return
    }

    const stageW = stage.clientWidth
    const stageH = stage.clientHeight
    physicsRef.current = fragRefs.current.map((el): FragPhysics | null => {
      if (!el) return null
      const ol = el.offsetLeft
      const ot = el.offsetTop
      return {
        x: 0,
        y: 0,
        vx: (Math.random() * 2 - 1) * 320,
        vy: -(60 + Math.random() * 280),
        rot: 0,
        vr: (Math.random() * 2 - 1) * 260,
        minX: -ol,
        maxX: stageW - ol - el.offsetWidth,
        minY: -ot,
        maxY: stageH - ot - el.offsetHeight,
        asleep: false,
      }
    })

    cancelAnimationFrame(rafRef.current)
    let last = performance.now()
    let elapsed = 0
    const step = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.033)
      last = now
      elapsed += dt
      const state = physicsRef.current
      if (!state) return
      if (elapsed > 6) for (const s of state) if (s) s.asleep = true // safety net

      let allAsleep = true
      for (let i = 0; i < state.length; i++) {
        const s = state[i]
        if (!s || s.asleep) continue
        s.vy += 900 * dt // gravity
        s.x += s.vx * dt
        s.y += s.vy * dt
        s.rot += s.vr * dt
        if (s.x <= s.minX) { s.x = s.minX; s.vx = Math.abs(s.vx) * 0.5 }
        if (s.x >= s.maxX) { s.x = s.maxX; s.vx = -Math.abs(s.vx) * 0.5 }
        if (s.y <= s.minY && s.vy < 0) { s.y = s.minY; s.vy = -s.vy * 0.42 }
        const onGround = s.y >= s.maxY - 0.5
        if (s.y >= s.maxY) {
          s.y = s.maxY
          if (s.vy > 0) s.vy = -s.vy * 0.42 // damped bounce
          s.vx *= 0.72
          s.vr *= 0.5
        }
        if (onGround) {
          s.vx *= Math.max(0, 1 - 4 * dt) // ground friction
          s.vr *= Math.max(0, 1 - 4 * dt)
          if (Math.abs(s.vx) < 6 && Math.abs(s.vr) < 15) {
            s.vx = 0
            s.vr = 0
            s.asleep = true
          }
        }
        const el = fragRefs.current[i]
        if (el) {
          el.style.transform = `translate3d(${s.x.toFixed(2)}px, ${s.y.toFixed(2)}px, 0) rotate(${s.rot.toFixed(2)}deg)`
          el.style.opacity = '0.5'
        }
        if (!s.asleep) allAsleep = false
      }
      if (allAsleep) {
        rafRef.current = 0
        return // loop parks itself once the debris settles
      }
      rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
  }

  const restore = () => {
    if (modeRef.current !== 'crashed') return
    setBoth('restoring')
    const state = physicsRef.current

    if (reduced || !state) {
      for (const el of fragRefs.current) {
        if (el) {
          el.style.transform = ''
          el.style.opacity = '1'
        }
      }
      physicsRef.current = null
      setBoth('idle')
      return
    }

    cancelAnimationFrame(rafRef.current)
    let last = performance.now()
    const step = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.033)
      last = now
      let done = true
      const k = 1 - Math.pow(0.002, dt) // frame-rate independent lerp
      for (let i = 0; i < state.length; i++) {
        const s = state[i]
        const el = fragRefs.current[i]
        if (!s || !el) continue
        s.x += (0 - s.x) * k
        s.y += (0 - s.y) * k
        s.rot += (0 - s.rot) * k
        if (Math.abs(s.x) < 0.4 && Math.abs(s.y) < 0.4 && Math.abs(s.rot) < 0.4) {
          s.x = 0
          s.y = 0
          s.rot = 0
          el.style.transform = ''
          el.style.opacity = '1'
        } else {
          done = false
          el.style.transform = `translate3d(${s.x.toFixed(2)}px, ${s.y.toFixed(2)}px, 0) rotate(${s.rot.toFixed(2)}deg)`
        }
      }
      if (done) {
        rafRef.current = 0
        physicsRef.current = null
        setBoth('idle')
        return
      }
      rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
  }

  return (
    <ExperimentCard
      code="EXP-03"
      title="BREAK IT"
      instruction="Click the interface. Destroy it. Then rebuild."
      control={
        <LabToggle
          active={mode !== 'idle'}
          onClick={mode === 'idle' ? crash : restore}
          disabled={mode === 'restoring'}
          ariaLabel={mode === 'idle' ? 'Crash the mock interface' : 'Restore the mock interface'}
        >
          {mode === 'idle' ? 'CRASH' : 'RESTORE SYSTEM'}
        </LabToggle>
      }
    >
      <div
        ref={stageRef}
        className="absolute inset-0"
        aria-hidden
        onClick={() => {
          if (finePointerRef.current) crash()
        }}
      >
        {UI_FRAGMENTS.map((fragment, i) => (
          <div
            key={fragment.id}
            ref={(el) => {
              fragRefs.current[i] = el
            }}
            className={cn('absolute will-change-transform', fragment.className)}
            style={fragment.style}
          >
            {fragment.label}
          </div>
        ))}
        <AnimatePresence>
          {mode === 'crashed' ? (
            <motion.p
              key="segfault"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: EASE_OUT_EXPO }}
              className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
            >
              <span className="animate-blink-caret font-mono-tight text-[10px] text-violet-300">
                SEGFAULT AT 0x0B5CED
              </span>
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>
    </ExperimentCard>
  )
}

/* ------------------------------------------------------------------ */
/* EXP-04 — TEXT ORBIT                                                 */
/* Letters sit on a circle via rotateY(angle) translateZ(radius); one  */
/* rAF loop rotates the ring (12s/turn) and writes transform+opacity   */
/* per letter from its depth. Reduced motion → static ring.            */
/* ------------------------------------------------------------------ */

function OrbitStage({ chars, reduced }: { chars: string[]; reduced: boolean | null }) {
  const stageRef = useRef<HTMLDivElement | null>(null)
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([])
  const lettersRef = useRef<string[]>(chars)
  const rotRef = useRef(0)
  const radiusRef = useRef(90)

  const layout = useCallback(() => {
    const n = Math.max(lettersRef.current.length, 1)
    for (let i = 0; i < letterRefs.current.length; i++) {
      const el = letterRefs.current[i]
      if (!el) continue
      const angle = rotRef.current + (360 / n) * i
      const depth = (Math.cos((angle * Math.PI) / 180) + 1) / 2 // 1 = facing viewer, 0 = backface
      el.style.transform = `translate(-50%, -50%) rotateY(${angle}deg) translateZ(${radiusRef.current}px) scale(${(0.78 + 0.22 * depth).toFixed(3)})`
      el.style.opacity = (0.26 + 0.46 * depth).toFixed(3)
    }
  }, [])

  useEffect(() => {
    lettersRef.current = chars
    letterRefs.current.length = chars.length
    if (reduced) layout()
  }, [chars, reduced, layout])

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const updateRadius = () => {
      radiusRef.current = Math.max(52, Math.min(90, stage.clientWidth * 0.28))
    }
    updateRadius()
    const ro = new ResizeObserver(() => {
      updateRadius()
      if (reduced) layout()
    })
    ro.observe(stage)

    if (reduced) {
      layout()
      return () => ro.disconnect()
    }

    let raf = 0
    let last = performance.now()
    const step = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      rotRef.current = (rotRef.current + dt * 30) % 360 // 360° / 12s
      layout()
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [reduced, layout])

  const n = Math.max(chars.length, 1)

  return (
    <div ref={stageRef} className="absolute inset-0" style={{ perspective: '1200px' }} aria-hidden>
      <span
        aria-hidden
        className="animate-core-pulse absolute left-1/2 top-1/2 -ml-[3px] -mt-[3px] block h-1.5 w-1.5 rounded-full bg-violet-400 shadow-[0_0_14px_rgba(139,92,246,0.9)]"
      />
      <div className="absolute left-1/2 top-1/2" style={{ transformStyle: 'preserve-3d' }}>
        {chars.map((ch, i) => (
          <span
            key={i}
            ref={(el) => {
              letterRefs.current[i] = el
            }}
            className="font-mono absolute left-0 top-0 text-[22px] font-medium leading-none text-violet-200 will-change-transform"
            style={{
              transform: `translate(-50%, -50%) rotateY(${(360 / n) * i}deg) translateZ(90px)`,
              opacity: 0.55,
            }}
          >
            {ch === ' ' ? '\u00A0' : ch}
          </span>
        ))}
      </div>
    </div>
  )
}

function TextOrbitExperiment() {
  const [value, setValue] = useState('EO-7')
  const reduced = useReducedMotion()
  const chars = useMemo(() => Array.from(value), [value])

  return (
    <ExperimentCard
      code="EXP-04"
      title="TEXT ORBIT"
      instruction="Type something. Watch it orbit."
      control={
        <input
          value={value}
          onChange={(e) => setValue(e.target.value.slice(0, 18))}
          maxLength={18}
          aria-label="Text to orbit"
          placeholder="TYPE…"
          className="w-36 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100 transition-colors placeholder:text-zinc-600 focus:border-violet-400/60 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
        />
      }
    >
      <OrbitStage chars={chars} reduced={reduced} />
    </ExperimentCard>
  )
}

/* ------------------------------------------------------------------ */
/* EXP-05 — REAL ASSETS: actual glTF PBR models in a live viewer       */
/* ------------------------------------------------------------------ */

function RealAssetsExperiment() {
  const [ok, setOk] = useState(false)
  useEffect(() => setOk(webglSupported()), [])

  return (
    <ExperimentCard
      code="EXP-05"
      title="REAL ASSETS"
      instruction="Actual glTF PBR models under studio lighting. Pick one, orbit it, zoom in."
      stageClassName="h-[26rem] border-t-0 sm:h-[30rem]"
    >
      {ok ? (
        <ModelViewer />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-4">
          <span className="font-mono-tight text-6xl leading-none text-zinc-900/40" aria-hidden>
            ⬢
          </span>
          <span className="font-mono-tight text-[10px] text-zinc-500">
            WEBGL UNAVAILABLE — 3D VIEWER OFFLINE
          </span>
        </div>
      )}
    </ExperimentCard>
  )
}

/* ------------------------------------------------------------------ */
/* ACT 05 — THE LAB                                                    */
/* ------------------------------------------------------------------ */

export default function ActLab() {
  const sectionRef = useRef<HTMLElement>(null)
  const inView = useInView(sectionRef, { once: true, margin: '-15% 0px -15% 0px' })
  const saidRef = useRef(false)
  const say = useCompanion((s) => s.say)

  useEffect(() => {
    if (!inView || saidRef.current) return
    if (typeof window !== 'undefined' && window.innerWidth < 640) return
    saidRef.current = true
    say('You can touch anything in here.')
  }, [inView, say])

  return (
    <section id="lab" ref={sectionRef} className="relative py-24 sm:py-32 lg:py-40">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <ActHeader
          index="05"
          code="THE LAB"
          title={<>Where I break things on purpose.</>}
          blurb="Experiments, toys and prototypes. Nothing here is a product. Everything here teaches me something."
        />
        <Reveal delay={0.1}>
          <p className="font-mono-tight mt-5 flex items-center gap-2 text-[10px] text-violet-300/70">
            <span className="text-violet-400" aria-hidden>
              ⚠
            </span>
            EO-7 SAYS: CAREFUL. SOME OF THESE EXPERIMENTS ARE UNSTABLE.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-4 sm:gap-6 md:grid-cols-2">
          <Reveal delay={0.05} className="h-full">
            <ExperimentCard
              code="EXP-01"
              title="PARTICLE FIELD"
              instruction="Move your cursor — the field follows you."
            >
              <ParticleExperiment />
            </ExperimentCard>
          </Reveal>
          <Reveal delay={0.1} className="h-full">
            <GravityExperiment />
          </Reveal>
          <Reveal delay={0.15} className="h-full">
            <BreakExperiment />
          </Reveal>
          <Reveal delay={0.2} className="h-full">
            <TextOrbitExperiment />
          </Reveal>
          <Reveal delay={0.25} className="h-full md:col-span-2">
            <RealAssetsExperiment />
          </Reveal>
        </div>
      </div>
    </section>
  )
}
