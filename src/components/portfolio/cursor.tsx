'use client'

import { useEffect, useState } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'

const INTERACTIVE_SELECTOR = 'a, button, [data-magnetic], input, textarea, select, [role="button"]'

export default function CustomCursor() {
  const [finePointer, setFinePointer] = useState(false)
  const [awake, setAwake] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [inWindow, setInWindow] = useState(true)
  const reduced = useReducedMotion() ?? false

  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const dotX = useSpring(x, { stiffness: 600, damping: 40 })
  const dotY = useSpring(y, { stiffness: 600, damping: 40 })
  const ringX = useSpring(x, { stiffness: 150, damping: 18 })
  const ringY = useSpring(y, { stiffness: 150, damping: 18 })

  useEffect(() => {
    const mq = window.matchMedia('(pointer: fine)')
    const sync = () => setFinePointer(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    if (!finePointer || reduced) return

    const onMove = (e: PointerEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
      setAwake(true)
    }
    const onOver = (e: MouseEvent) => {
      const target = e.target
      setHovered(target instanceof Element && target.closest(INTERACTIVE_SELECTOR) !== null)
    }
    const onLeaveDoc = () => setInWindow(false)
    const onEnterDoc = () => setInWindow(true)

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('mouseover', onOver)
    document.addEventListener('mouseout', onOver)
    document.addEventListener('mouseleave', onLeaveDoc)
    document.addEventListener('mouseenter', onEnterDoc)

    return () => {
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseout', onOver)
      document.removeEventListener('mouseleave', onLeaveDoc)
      document.removeEventListener('mouseenter', onEnterDoc)
    }
  }, [finePointer, reduced, x, y])

  return (
    <>
      <style>{`
        @media (pointer: fine) and (prefers-reduced-motion: reduce) {
          .portfolio-root, .portfolio-root * { cursor: auto !important; }
          .portfolio-root input, .portfolio-root textarea { cursor: text !important; }
        }
        .portfolio-root :where(a, button, input, textarea, select, [tabindex], [role="button"]):focus-visible {
          outline: 2px solid #c4b5fd;
          outline-offset: 3px;
        }
        @media (forced-colors: active) {
          .portfolio-root :where(a, button, input, textarea, select, [tabindex], [role="button"]):focus-visible {
            outline: 2px solid CanvasText;
            outline-offset: 3px;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .portfolio-root *, .portfolio-root *::before, .portfolio-root *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>

      {!finePointer || reduced || !awake ? null : (
        <>
          <motion.div
            aria-hidden
            className="pointer-events-none fixed left-0 top-0 z-[90] -ml-1 -mt-1 h-2 w-2 rounded-full bg-violet-400 shadow-[0_0_14px_rgba(139,92,246,0.95)] will-change-transform"
            style={{ x: dotX, y: dotY }}
            animate={{ scale: hovered ? 0.5 : 1, opacity: inWindow ? 1 : 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          />
          <motion.div
            aria-hidden
            className={`pointer-events-none fixed left-0 top-0 z-[90] -ml-[15px] -mt-[15px] h-[30px] w-[30px] rounded-full border will-change-transform ${
              hovered ? 'border-violet-400/90 shadow-[0_0_18px_rgba(139,92,246,0.35)]' : 'border-white/40'
            }`}
            style={{ x: ringX, y: ringY }}
            animate={{ scale: hovered ? 1.8 : 1, opacity: inWindow ? 1 : 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          />
        </>
      )}
    </>
  )
}
