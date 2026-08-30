'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import { EASE_OUT_EXPO, useCompanion } from './kit'
import { NAV_LINKS, PROJECTS, STACK_ITEMS, STACK_LEARNING } from '@/lib/portfolio-data'

/* ------------------------------------------------------------------ */
/* EO-7://CONSOLE — the portfolio as an operable system.               */
/* Open with ⌘K / Ctrl+K / ` — execute commands, jump between acts.    */
/* ------------------------------------------------------------------ */

type LogLine = {
  id: number
  kind: 'in' | 'out' | 'sys' | 'err'
  text: string
  time: string
}

const ACT_ALIASES: Record<string, string> = {
  entry: 'entry',
  '1': 'entry',
  engine: 'engine',
  '2': 'engine',
  process: 'process',
  pipeline: 'process',
  '3': 'process',
  work: 'work',
  projects: 'work',
  '4': 'work',
  lab: 'lab',
  experiments: 'lab',
  '5': 'lab',
  human: 'human',
  about: 'human',
  '6': 'human',
  stack: 'stack',
  tech: 'stack',
  tools: 'stack',
  '7': 'stack',
  signal: 'signal',
  contact: 'signal',
  '8': 'signal',
}

const HELP_LINES = [
  'AVAILABLE COMMANDS',
  '  help ................ this list',
  '  goto <act> .......... jump to an act (e.g. "goto work", "goto 5")',
  '  acts ................ list all acts',
  '  whoami .............. identify the engineer',
  '  stack ............... print the technology stack',
  '  projects ............ list shipped systems',
  '  project <id> ........ deep-link into a system story',
  '  resume .............. print / save the dossier as PDF',
  '  status .............. live system status + signal count',
  '  contact ............. open a channel (ACT 08)',
  '  reboot .............. replay the boot sequence',
  '  clear ............... clear this console',
  '  exit ................ close the console',
]

function now(): string {
  return new Date().toLocaleTimeString('en-GB', { hour12: false })
}

function sessionStart(): number {
  return Date.now()
}

export default function CommandConsole() {
  const [open, setOpen] = useState(false)
  const [lines, setLines] = useState<LogLine[]>([])
  const [value, setValue] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [historyIdx, setHistoryIdx] = useState(-1)

  const inputRef = useRef<HTMLInputElement>(null)
  const logRef = useRef<HTMLDivElement>(null)
  const idRef = useRef(0)
  const bootedAt = useRef<number>(0)
  const openRef = useRef(false)

  useEffect(() => {
    openRef.current = open
  }, [open])

  const push = useCallback((kind: LogLine['kind'], text: string) => {
    idRef.current += 1
    const id = idRef.current // capture BEFORE the updater (StrictMode-safe, unique keys)
    setLines((prev) => [...prev.slice(-120), { id, kind, text, time: now() }])
  }, [])

  const printBoot = useCallback(() => {
    push('sys', 'EO-7://CONSOLE v2.6 — direct line to the system.')
    push('sys', 'Type "help" for commands. Press "?" for the operator manual. ESC closes.')
  }, [push])

  /* ------------------------- open / close ------------------------- */

  const openConsole = useCallback(() => {
    setOpen((was) => {
      if (was) return was
      bootedAt.current = Date.now()
      return true
    })
  }, [])

  const closeConsole = useCallback(() => setOpen(false), [])

  useEffect(() => {
    const onOpenEvent = () => openConsole()
    window.addEventListener('eo:console:open', onOpenEvent)
    return () => window.removeEventListener('eo:console:open', onOpenEvent)
  }, [openConsole])

  /* hotkeys: ⌘K / Ctrl+K / backtick (outside inputs) */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const typing =
        !!target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        if (openRef.current) closeConsole()
        else openConsole()
        return
      }
      if (!typing && !openRef.current && e.key === '`') {
        e.preventDefault()
        openConsole()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openConsole, closeConsole])

  /* focus input + lock scroll while open + flag for other key handlers */
  useEffect(() => {
    if (!open) return
    printBoot()
    document.body.dataset.consoleOpen = 'true'
    const id = window.setTimeout(() => inputRef.current?.focus(), 60)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.clearTimeout(id)
      document.body.style.overflow = prevOverflow
      delete document.body.dataset.consoleOpen
    }
  }, [open, printBoot])

  /* autoscroll log */
  useEffect(() => {
    const el = logRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [lines, open])

  /* --------------------------- commands --------------------------- */

  const scrollToAct = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const exec = useCallback(
    async (raw: string) => {
      const input = raw.trim()
      if (!input) return
      push('in', input)
      setHistory((h) => [input, ...h].slice(0, 40))
      setHistoryIdx(-1)

      const [cmdRaw, ...rest] = input.toLowerCase().split(/\s+/)
      const cmd = cmdRaw
      const arg = rest.join(' ')

      switch (cmd) {
        case 'help':
          HELP_LINES.forEach((l) => push('out', l))
          break

        case 'acts':
          NAV_LINKS.forEach((l, i) =>
            push('out', `  ACT 0${i + 1} — ${l.label.padEnd(7)} → ${l.href.replace('#', '/#')}`)
          )
          break

        case 'goto': {
          const target = ACT_ALIASES[arg] ?? ACT_ALIASES[cmdRaw]
          if (!arg) {
            push('err', 'goto WHERE? try "goto work" or "help".')
          } else if (target) {
            push('sys', `NAVIGATING → ${target.toUpperCase()} ...`)
            closeConsole()
            window.setTimeout(() => scrollToAct(target), 120)
          } else {
            push('err', `UNKNOWN ACT "${arg}" — try "acts".`)
          }
          break
        }

        case 'whoami':
          push('out', 'ELVIN OMONDI')
          push('out', '  SOFTWARE ENGINEER · PRODUCT BUILDER · CREATIVE DEVELOPER')
          push('out', '  NAIROBI, KENYA · UTC+3 · STATUS: BUILDING')
          break

        case 'stack':
          STACK_ITEMS.forEach((i) => {
            const bar = '█'.repeat(Math.round(i.level / 10)).padEnd(10, '░')
            push('out', `  ${bar} ${String(i.level).padStart(3)}%  ${i.name}`)
          })
          push('sys', 'LOADING NEXT → ' + STACK_LEARNING.join(' · '))
          break

        case 'projects':
          PROJECTS.forEach((p) => push('out', `  ${p.num}  ${p.name.padEnd(15)} ${p.tagline}`))
          push('sys', 'TIP → "project fleetflow" jumps straight into the story.')
          break

        case 'project': {
          const query = arg.toLowerCase().replace(/[\s_]+/g, '-')
          const target =
            PROJECTS.find((p) => p.id === query) ??
            PROJECTS.find((p) => p.num === query.padStart(2, '0')) ??
            PROJECTS.find((p) => p.name.toLowerCase().replace(/\s+/g, '-').includes(query) && query.length >= 3)
          if (!arg) {
            push('err', 'project WHICH? try "project restaurant-os" or "projects".')
          } else if (target) {
            push('sys', `OPENING SYSTEM ${target.num} — ${target.name.toUpperCase()} ...`)
            closeConsole()
            window.setTimeout(() => {
              window.location.hash = `project-${target.id}`
            }, 150)
          } else {
            push('err', `UNKNOWN SYSTEM "${arg}" — try "projects" for the manifest.`)
          }
          break
        }

        case 'resume':
        case 'cv':
          push('sys', 'PREPARING PRINT DOSSIER ...')
          push('out', '  Use the system dialog → "Save as PDF" for a clean copy.')
          closeConsole()
          window.setTimeout(() => window.print(), 350)
          break

        case 'status': {
          const secs = Math.floor((Date.now() - (bootedAt.current || Date.now())) / 1000)
          push('out', `  STATUS ......... ONLINE`)
          push('out', `  ACTS ........... 08/08 LOADED`)
          push('out', `  SESSION ........ ${String(Math.floor(secs / 60)).padStart(2, '0')}m ${String(secs % 60).padStart(2, '0')}s`)
          try {
            const res = await fetch('/api/contact', { cache: 'no-store' })
            const data = (await res.json()) as { ok: boolean; signals?: number }
            push('out', `  SIGNALS ........ ${String(data.signals ?? 0).padStart(3, '0')} ON RECORD`)
          } catch {
            push('out', '  SIGNALS ........ [LINK BUSY — RETRY]')
          }
          push('out', `  MOOD ........... SHIPPING`)
          break
        }

        case 'contact':
        case 'signal':
          push('sys', 'OPENING A CHANNEL ...')
          closeConsole()
          window.setTimeout(() => scrollToAct('signal'), 120)
          break

        case 'reboot':
          push('sys', 'REBOOTING EXPERIENCE ...')
          closeConsole()
          window.scrollTo({ top: 0, behavior: 'auto' })
          window.setTimeout(() => window.dispatchEvent(new CustomEvent('eo:reboot')), 250)
          useCompanion.getState().say('Reboot complete. Welcome back, operator.')
          break

        case 'clear':
          setLines([])
          break

        case 'exit':
        case 'close':
        case 'quit':
          closeConsole()
          break

        default:
          push('err', `COMMAND NOT FOUND: ${cmd} — try "help".`)
      }
    },
    [push, closeConsole, scrollToAct]
  )

  /* ---------------------------- render ---------------------------- */

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="eo-console"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: EASE_OUT_EXPO }}
          className="fixed inset-0 z-[95] flex items-start justify-center bg-black/70 px-4 pt-[12vh] backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeConsole()
          }}
          role="dialog"
          aria-modal="true"
          aria-label="EO-7 command console"
        >
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
            className="glass accent-glow w-full max-w-2xl overflow-hidden rounded-2xl border-violet-400/25"
          >
            {/* title bar */}
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <span className="flex gap-1.5" aria-hidden>
                  <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                  <span className="h-2.5 w-2.5 rounded-full bg-violet-400/80 shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
                </span>
                <span className="font-mono-tight text-[10px] text-zinc-400">
                  EO-7://CONSOLE
                </span>
              </div>
              <button
                type="button"
                onClick={closeConsole}
                aria-label="Close console"
                className="flex h-8 min-w-[32px] items-center justify-center rounded-md border border-white/10 px-2 font-mono-tight text-[10px] text-zinc-500 transition-colors hover:border-violet-400/40 hover:text-violet-300"
              >
                ESC
              </button>
            </div>

            {/* log */}
            <div
              ref={logRef}
              className="h-[300px] overflow-y-auto px-4 py-3 font-mono text-xs leading-relaxed sm:h-[320px]"
              aria-live="polite"
            >
              {lines.map((l) => (
                <div key={l.id} className="flex gap-2">
                  <span className="shrink-0 select-none text-zinc-700">{l.time}</span>
                  <span
                    className={
                      l.kind === 'in'
                        ? 'text-violet-300'
                        : l.kind === 'err'
                          ? 'text-red-400/90'
                          : l.kind === 'sys'
                            ? 'text-zinc-500'
                            : 'whitespace-pre-wrap text-zinc-300'
                    }
                  >
                    {l.kind === 'in' ? `❯ ${l.text}` : l.text}
                  </span>
                </div>
              ))}
              {!open && null}
            </div>

            {/* input */}
            <form
              className="flex items-center gap-2 border-t border-white/10 px-4 py-3"
              onSubmit={(e) => {
                e.preventDefault()
                void exec(value)
                setValue('')
              }}
            >
              <span aria-hidden className="font-mono text-xs text-violet-400">
                ❯
              </span>
              <input
                ref={inputRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    e.preventDefault()
                    closeConsole()
                    return
                  }
                  if (e.key === 'ArrowUp') {
                    e.preventDefault()
                    const next = Math.min(historyIdx + 1, history.length - 1)
                    if (next >= 0) {
                      setHistoryIdx(next)
                      setValue(history[next] ?? '')
                    }
                    return
                  }
                  if (e.key === 'ArrowDown') {
                    e.preventDefault()
                    const next = historyIdx - 1
                    setHistoryIdx(next)
                    setValue(next >= 0 ? (history[next] ?? '') : '')
                  }
                }}
                spellCheck={false}
                autoCapitalize="off"
                autoComplete="off"
                aria-label="Console command input"
                placeholder="type a command… (help)"
                className="min-h-[36px] w-full bg-transparent font-mono text-xs text-zinc-100 outline-none placeholder:text-zinc-600"
              />
              <span className="font-mono-tight hidden text-[9px] text-zinc-600 sm:block">
                ENTER ⏎
              </span>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
