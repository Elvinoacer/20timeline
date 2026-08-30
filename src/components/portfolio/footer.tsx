'use client'

import { useEffect, useState } from 'react'
import { CONTACT, NAV_LINKS, PROJECTS, STACK_ITEMS, SYSTEMS } from '@/lib/portfolio-data'

/* ------------------------------------------------------------------ */
/* SiteFooter — in normal flow, system status ticker                   */
/* ------------------------------------------------------------------ */

const STATS: { label: string; value: string; live?: boolean }[] = [
  { label: 'STATUS', value: 'ONLINE', live: true },
  { label: 'BUILD', value: '2026.08' },
  { label: 'LOCATION', value: 'NAIROBI · UTC+3' },
  { label: 'SYSTEMS', value: String(SYSTEMS.length).padStart(2, '0') },
  { label: 'PROJECTS', value: String(PROJECTS.length).padStart(2, '0') },
  { label: 'EXPERIMENTS', value: '04' },
  { label: 'STACK MODULES', value: String(STACK_ITEMS.length).padStart(2, '0') },
]

/* live Nairobi clock — hydration-safe (renders after mount) */
function LocalTime() {
  const [time, setTime] = useState<string | null>(null)

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Africa/Nairobi',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
    const tick = () => setTime(fmt.format(new Date()))
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [])

  return (
    <span className="font-mono-tight flex items-center gap-2 text-[10px] text-zinc-500">
      LOCAL TIME:
      <span className="text-zinc-400 tabular-nums">{time ?? '--:--:--'}</span>
      <span className="text-violet-400/70">EAT</span>
    </span>
  )
}

export default function SiteFooter() {
  return (
    <footer className="relative border-t border-white/10">
      <div className="mx-auto max-w-7xl px-5 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-10 sm:px-8">
        {/* row 1 */}
        <div className="flex flex-col justify-between gap-6 sm:flex-row">
          <div>
            <p className="font-mono-tight text-xs text-zinc-200">EO © 2026</p>
            <p className="mt-2 text-sm text-zinc-500">Built as a system, not a page.</p>
          </div>

          <nav aria-label="Footer" className="flex max-w-sm flex-wrap gap-x-5 gap-y-2 sm:justify-center">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="font-mono-tight text-[10px] text-zinc-500 transition-colors duration-300 hover:text-violet-300"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {CONTACT.socials.map((social) => (
              <a
                key={social.href}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                className="group font-mono-tight inline-flex items-center gap-1 text-[10px] text-zinc-400 transition-colors duration-300 hover:text-violet-300"
              >
                {social.label}
                <span aria-hidden className="text-zinc-600 transition-colors duration-300 group-hover:text-violet-300">
                  ↗
                </span>
              </a>
            ))}
            <a
              href={`mailto:${CONTACT.email}`}
              className="group font-mono-tight inline-flex items-center gap-1 text-[10px] text-zinc-400 transition-colors duration-300 hover:text-violet-300"
            >
              {CONTACT.email}
              <span aria-hidden className="text-zinc-600 transition-colors duration-300 group-hover:text-violet-300">
                ↗
              </span>
            </a>
          </div>
        </div>

        {/* row 2 — status ticker */}
        <div className="hairline my-8" aria-hidden />
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {STATS.map((stat) => (
            <span key={stat.label} className="font-mono-tight flex items-center gap-2 text-[10px] text-zinc-500">
              {stat.label}:
              {stat.live ? (
                <span className="relative flex h-1.5 w-1.5" aria-hidden>
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
              ) : null}
              <span className="text-zinc-400">{stat.value}</span>
            </span>
          ))}
          <LocalTime />
          <span className="font-mono-tight hidden items-center gap-2 text-[10px] text-zinc-500 sm:flex">
            CONSOLE:
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('eo:console:open'))}
              aria-label="Open EO-7 command console"
              className="min-h-[20px] rounded border border-white/10 px-1.5 text-[9px] text-zinc-400 transition-all duration-300 hover:border-violet-400/50 hover:text-violet-300"
            >
              ⌘K
            </button>
          </span>
        </div>
      </div>
    </footer>
  )
}
