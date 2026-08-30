'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion'

import { NAV_LINKS } from '@/lib/portfolio-data'
import { cn } from '@/lib/utils'
import { EASE_OUT_EXPO } from './kit'

/* ------------------------------------------------------------------ */
/* SiteNav — monogram, section tracking, scroll progress, mobile menu  */
/* ------------------------------------------------------------------ */

export default function SiteNav({ booted }: { booted: boolean }) {
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('#entry')
  const [open, setOpen] = useState(false)

  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 })

  /* glass backdrop after 40px of scroll */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* active section via IntersectionObserver over the 6 NAV_LINKS targets */
  useEffect(() => {
    const sections = NAV_LINKS
      .map((link) => document.getElementById(link.href.replace('#', '')))
      .filter((el): el is HTMLElement => el !== null)
    if (sections.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(`#${entry.target.id}`)
        })
      },
      /* a band around the upper-middle of the viewport decides the active section */
      { rootMargin: '-35% 0px -55% 0px', threshold: 0 }
    )
    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  /* Escape closes the overlay + body scroll lock while open */
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    const previous = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.documentElement.style.overflow = previous
    }
  }, [open])

  return (
    <>
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: booted ? 1 : 0 }}
        transition={{ duration: 0.8, delay: booted ? 0.2 : 0, ease: EASE_OUT_EXPO }}
        className={cn(
          'fixed inset-x-0 top-0 z-[80] border-b transition-[background-color,border-color,backdrop-filter] duration-500',
          scrolled ? 'glass border-b-white/5!' : 'border-b-transparent',
          booted ? 'visible' : 'invisible'
        )}
      >
        {/* scroll progress hairline */}
        <motion.div
          aria-hidden
          className="absolute inset-x-0 top-0 h-[2px] origin-left bg-gradient-to-r from-violet-600 via-violet-400 to-violet-300"
          style={{ scaleX: progress }}
        />

        <div className="flex items-center justify-between px-5 py-4 sm:px-8">
          <a href="#entry" aria-label="Elvin Omondi — back to top" className="flex items-center gap-3">
            <span className="font-mono-tight flex h-9 w-9 items-center justify-center border border-violet-400/60 text-[11px] text-violet-300 shadow-[0_0_18px_rgba(139,92,246,0.25)]">
              EO
            </span>
            <span className="font-mono-tight hidden text-[10px] text-zinc-400 sm:block">ELVIN OMONDI</span>
          </a>

          {/* desktop links */}
          <nav aria-label="Primary" className="hidden items-center gap-6 md:flex lg:gap-8">
            {NAV_LINKS.map((link) => {
              const isActive = active === link.href
              return (
                <a
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? 'true' : undefined}
                  className={cn(
                    'font-mono-tight flex items-center gap-2 text-[10px] transition-colors duration-300',
                    isActive ? 'text-zinc-100' : 'text-zinc-500 hover:text-violet-300'
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      'h-1 w-1 rounded-full bg-violet-400 shadow-[0_0_6px_rgba(139,92,246,0.9)] transition-opacity duration-300',
                      isActive ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {link.label}
                </a>
              )
            })}

            {/* console hint chip — opens the EO-7 console */}
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('eo:console:open'))}
              aria-label="Open EO-7 command console (Ctrl+K)"
              className="font-mono-tight ml-2 hidden min-h-[28px] items-center gap-1.5 rounded-md border border-white/10 px-2 text-[9px] text-zinc-500 transition-all duration-300 hover:border-violet-400/50 hover:text-violet-300 hover:shadow-[0_0_16px_rgba(139,92,246,0.25)] lg:inline-flex"
            >
              <span aria-hidden className="text-violet-400/80">
                ❯
              </span>
              ⌘K
            </button>
          </nav>

          {/* mobile hamburger */}
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="flex h-11 w-11 items-center justify-center md:hidden"
          >
            <span aria-hidden className="flex flex-col gap-[5px]">
              <span className="h-px w-5 bg-zinc-300" />
              <span className="h-px w-5 bg-zinc-300" />
            </span>
          </button>
        </div>
      </motion.header>

      {/* full-screen mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
            className="fixed inset-0 z-[85] flex flex-col bg-[#050505]/95 px-5 py-4 backdrop-blur-xl sm:px-8"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono-tight flex h-9 w-9 items-center justify-center border border-violet-400/60 text-[11px] text-violet-300">
                EO
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="flex h-11 w-11 items-center justify-center text-zinc-400 transition-colors hover:text-zinc-100"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <nav aria-label="Mobile" className="flex flex-1 flex-col justify-center">
              {NAV_LINKS.map((link, index) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 + index * 0.06, ease: EASE_OUT_EXPO }}
                  className="group flex items-baseline gap-4 border-b border-white/5 py-4"
                >
                  <span className="font-mono-tight text-[10px] text-violet-400">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="text-4xl font-semibold tracking-tight text-zinc-100 transition-colors duration-300 group-hover:text-violet-300">
                    {link.label}
                  </span>
                </motion.a>
              ))}

              {/* EO-7 console — touch users get it too */}
              <motion.button
                type="button"
                onClick={() => {
                  setOpen(false)
                  window.setTimeout(() => window.dispatchEvent(new CustomEvent('eo:console:open')), 250)
                }}
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 + NAV_LINKS.length * 0.06, ease: EASE_OUT_EXPO }}
                className="group mt-6 flex min-h-[48px] items-center gap-3 rounded-xl border border-violet-400/25 bg-violet-500/[0.07] px-4 text-left transition-all duration-300 hover:border-violet-400/50 hover:bg-violet-500/15"
              >
                <span aria-hidden className="font-mono text-sm text-violet-400">❯</span>
                <span className="font-mono-tight text-[11px] text-violet-200">OPEN EO-7 CONSOLE</span>
                <span aria-hidden className="font-mono-tight ml-auto text-[9px] text-zinc-500 transition-transform duration-300 group-hover:translate-x-0.5">
                  →
                </span>
              </motion.button>
            </nav>

            <p className="font-mono-tight text-[10px] text-zinc-600">EO // NAV v2.6</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
