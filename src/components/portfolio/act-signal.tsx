'use client'

import { Fragment, useEffect, useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import { CONTACT } from '@/lib/portfolio-data'
import { ActHeader, EASE_OUT_EXPO, PrimaryButton, Reveal, useCompanion } from '@/components/portfolio/kit'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'

/* ------------------------------------------------------------------ */
/* ACT 08 — THE SIGNAL (contact / conversion)                          */
/* ------------------------------------------------------------------ */

type Status = 'idle' | 'sending' | 'success' | 'error'
type FieldErrors = { name?: string; email?: string; message?: string }

const CONVERGENCE_LABELS_ROW_1 = ['WEB', 'MOBILE', 'DESKTOP', 'SYSTEMS']
const CONVERGENCE_LABELS_ROW_2 = ['PEOPLE', 'IDEAS']

const STATUS_ROWS: [string, string][] = [
  ['IDEAS', 'READY'],
  ['DESIGN', 'READY'],
  ['CODE', 'READY'],
  ['BUILD', 'READY'],
]

const STATS = ['PROJECTS: 03', 'SYSTEMS: 04', 'EXPERIMENTS: 04', 'STACK MODULES: 21', 'AVG REPLY: < 24H', 'TIMEZONE: UTC+3']

const inputClass =
  'h-11 rounded-xl border-white/10 bg-white/[0.04] text-zinc-100 placeholder:text-zinc-600 focus-visible:border-violet-400/60 focus-visible:ring-violet-400/60'

export default function ActSignal() {
  const { toast } = useToast()
  const say = useCompanion((s) => s.say)

  const [status, setStatus] = useState<Status>('idle')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [reply, setReply] = useState('')

  /* live count of received signals (real data, fails silently) */
  const [signalCount, setSignalCount] = useState<number | null>(null)
  useEffect(() => {
    let cancelled = false
    fetch('/api/contact', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data: { ok: boolean; signals?: number }) => {
        if (!cancelled && data.ok && typeof data.signals === 'number') {
          setSignalCount(data.signals)
        }
      })
      .catch(() => {
        /* counter stays hidden when the link is unavailable */
      })
    return () => {
      cancelled = true
    }
  }, [])

  /* ---------------------------- clipboard ---------------------------- */

  function announceCopied() {
    toast({ title: 'EMAIL COPIED' })
  }

  async function copyEmail() {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('clipboard unavailable')
      await navigator.clipboard.writeText(CONTACT.email)
      announceCopied()
    } catch {
      // graceful fallback for non-secure contexts / older browsers
      try {
        const ta = document.createElement('textarea')
        ta.value = CONTACT.email
        ta.setAttribute('readonly', '')
        ta.style.position = 'fixed'
        ta.style.opacity = '0'
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
        announceCopied()
      } catch {
        toast({
          title: 'COPY FAILED',
          description: CONTACT.email,
          variant: 'destructive',
        })
      }
    }
  }

  /* ---------------------------- validation --------------------------- */

  function validate(): FieldErrors {
    const next: FieldErrors = {}
    if (name.trim().length < 2) next.name = 'NAME REQUIRED — MIN 2 CHARS'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = 'VALID EMAIL REQUIRED'
    if (message.trim().length < 10) next.message = 'MESSAGE TOO SHORT — MIN 10 CHARS'
    return next
  }

  function resetForm() {
    setName('')
    setEmail('')
    setMessage('')
    setErrors({})
    setStatus('idle')
  }

  /* ------------------------------ submit ----------------------------- */

  async function onSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault()
    if (status === 'sending') return

    const fieldErrors = validate()
    setErrors(fieldErrors)
    if (Object.keys(fieldErrors).length > 0) {
      toast({
        title: 'SIGNAL INCOMPLETE',
        description: 'Check the highlighted fields.',
        variant: 'destructive',
      })
      return
    }

    setStatus('sending')
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 15000)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), message: message.trim() }),
        signal: controller.signal,
      })
      const data: { ok?: boolean; reply?: string; error?: string } | null = await res
        .json()
        .catch(() => null)

      if (res.ok && data?.ok) {
        setReply(data.reply ?? 'SIGNAL RECEIVED — I reply within 24 hours.')
        setStatus('success')
        say('Signal received. Talk soon, human.')
      } else {
        throw new Error(data?.error ?? `HTTP ${res.status}`)
      }
    } catch (err) {
      setStatus('error')
      toast({
        title: 'TRANSMISSION FAILED',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      })
    } finally {
      clearTimeout(timer)
    }
  }

  /* ------------------------------ render ----------------------------- */

  return (
    <section id="signal" className="relative" aria-label="Contact — start a project">
      {/* ghost numeral watermark */}
      <span aria-hidden className="ghost-num absolute right-0 top-10 hidden lg:block">
        08
      </span>
      <div className="relative mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32 lg:py-40">
        <ActHeader
          index="08"
          code="THE SIGNAL"
          title={<>Have something worth building?</>}
          blurb="Tell me about the problem. I'll tell you honestly whether software is the right answer — and what it would take."
        />

        {/* ------------------- convergence motif (decorative) ------------------- */}
        <div aria-hidden className="pointer-events-none mt-16 flex select-none flex-col items-center opacity-70">
          <div className="flex max-w-lg flex-wrap justify-center gap-2">
            {CONVERGENCE_LABELS_ROW_1.map((label) => (
              <span
                key={label}
                className="font-mono-tight rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[10px] text-zinc-500"
              >
                {label}
              </span>
            ))}
          </div>
          <div className="mt-2 flex justify-center gap-2">
            {CONVERGENCE_LABELS_ROW_2.map((label) => (
              <span
                key={label}
                className="font-mono-tight rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[10px] text-zinc-500"
              >
                {label}
              </span>
            ))}
          </div>
          <div className="relative mt-3 h-14 w-full max-w-md">
            <svg
              viewBox="0 0 400 56"
              preserveAspectRatio="none"
              className="h-full w-full"
              fill="none"
            >
              {[50, 115, 180, 245, 310, 375].map((x) => (
                <line
                  key={x}
                  x1={x}
                  y1="0"
                  x2="200"
                  y2="52"
                  stroke="rgba(139,92,246,0.28)"
                  strokeWidth="1"
                />
              ))}
            </svg>
            <span className="animate-core-pulse absolute left-1/2 top-[47px] size-2.5 -translate-x-1/2 rounded-full bg-violet-400 shadow-[0_0_18px_rgba(139,92,246,0.9)]" />
          </div>
        </div>

        {/* ------------------------------ main grid ------------------------------ */}
        <div className="mt-14 grid gap-10 lg:grid-cols-2 lg:gap-16">
          {/* LEFT — direct channels */}
          <Reveal>
            <div>
              <span className="font-mono-tight inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[10px] text-zinc-300">
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
                </span>
                AVAILABLE FOR NEW PROJECTS
              </span>

              <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="text-xl font-medium text-zinc-100 underline-offset-8 decoration-violet-400/50 transition-colors hover:text-violet-300 hover:underline sm:text-2xl"
                >
                  {CONTACT.email}
                </a>
                <button
                  type="button"
                  onClick={copyEmail}
                  className="font-mono-tight inline-flex min-h-[44px] items-center rounded-full border border-white/10 bg-white/[0.04] px-4 text-[10px] text-zinc-400 transition-all duration-300 hover:border-violet-300/50 hover:text-violet-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400"
                  aria-label={`Copy email address ${CONTACT.email}`}
                >
                  COPY
                </button>
              </div>

              <p className="font-mono-tight mt-5 text-[10px] text-zinc-500">{CONTACT.location}</p>

              {/* printable dossier — window.print() reveals the print-only ResumeSheet */}
              <button
                type="button"
                onClick={() => window.print()}
                className="font-mono-tight group mt-5 inline-flex min-h-[44px] items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 text-[10px] text-zinc-400 transition-all duration-300 hover:border-violet-400/50 hover:bg-violet-500/[0.07] hover:text-violet-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400"
                aria-label="Print or save the dossier as PDF"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path
                    d="M4.5 5.5V1.5h7v4M4.5 12h-1A1.5 1.5 0 0 1 2 10.5V7a1.5 1.5 0 0 1 1.5-1.5h9A1.5 1.5 0 0 1 14 7v3.5a1.5 1.5 0 0 1-1.5 1.5h-1M4.5 9.5h7v5h-7v-5Z"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                PRINT / SAVE PDF DOSSIER
                <span aria-hidden className="text-zinc-600 transition-transform duration-300 group-hover:translate-x-0.5">
                  →
                </span>
              </button>

              {/* live signal counter — real data from /api/contact */}
              {signalCount !== null && (
                <p className="font-mono-tight mt-3 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/[0.06] px-3 py-1.5 text-[10px] text-zinc-400">
                  <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(139,92,246,0.9)]" />
                  SIGNALS ON RECORD:
                  <span className="text-violet-300">{String(signalCount).padStart(3, '0')}</span>
                </p>
              )}

              <ul className="mt-8">
                {CONTACT.socials.map((social) => (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex min-h-[44px] items-center justify-between border-b border-white/5 py-3 transition-all duration-300 hover:px-2 focus-visible:px-2 focus-visible:outline-none"
                    >
                      <span className="font-mono-tight text-xs text-zinc-400 transition-colors group-hover:text-violet-300">
                        {social.label}
                      </span>
                      <span
                        aria-hidden
                        className="font-mono-tight text-xs text-zinc-600 transition-colors group-hover:text-violet-300"
                      >
                        ↗
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          {/* RIGHT — form / success panel */}
          <Reveal delay={0.1}>
            <AnimatePresence mode="wait" initial={false}>
              {status === 'success' ? (
                <motion.div
                  key="success-panel"
                  role="status"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
                  className="glass rounded-2xl p-6 sm:p-8"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-mono-tight text-[10px] text-violet-300">SYSTEM STATUS</span>
                    <span className="hairline flex-1" aria-hidden />
                  </div>

                  <div className="mt-6 space-y-3">
                    {STATUS_ROWS.map(([k, v]) => (
                      <div key={k} className="flex items-baseline gap-3">
                        <span className="font-mono-tight text-[10px] text-zinc-500">{k}</span>
                        <span className="flex-1 border-b border-dotted border-white/15" aria-hidden />
                        <span className="font-mono-tight text-[10px] text-emerald-300/90">{v}</span>
                      </div>
                    ))}
                  </div>

                  <p className="font-mono-tight mt-6 text-[10px] text-zinc-500">
                    AWAITING INPUT <span className="animate-blink-caret text-violet-300">▌</span>
                  </p>

                  <p className="font-mono-tight mt-8 text-sm text-violet-300 text-glow">
                    SIGNAL RECEIVED.
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-400">{reply}</p>

                  <div className="mt-8">
                    <PrimaryButton onClick={resetForm}>SEND ANOTHER TRANSMISSION</PrimaryButton>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="form-panel"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
                  className="glass rounded-2xl p-6 sm:p-8"
                >
                  <form onSubmit={onSubmit} noValidate>
                    {/* NAME */}
                    <div>
                      <label htmlFor="signal-name" className="font-mono-tight text-[10px] text-zinc-500">
                        NAME
                      </label>
                      <Input
                        id="signal-name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        required
                        minLength={2}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Who is building with me?"
                        aria-invalid={Boolean(errors.name)}
                        className={`${inputClass} mt-2`}
                      />
                      {errors.name ? (
                        <p className="font-mono-tight mt-2 text-xs text-red-400/90">{errors.name}</p>
                      ) : null}
                    </div>

                    {/* EMAIL */}
                    <div className="mt-5">
                      <label htmlFor="signal-email" className="font-mono-tight text-[10px] text-zinc-500">
                        EMAIL
                      </label>
                      <Input
                        id="signal-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@company.com"
                        aria-invalid={Boolean(errors.email)}
                        className={`${inputClass} mt-2`}
                      />
                      {errors.email ? (
                        <p className="font-mono-tight mt-2 text-xs text-red-400/90">{errors.email}</p>
                      ) : null}
                    </div>

                    {/* MESSAGE */}
                    <div className="mt-5">
                      <div className="flex items-baseline justify-between">
                        <label htmlFor="signal-message" className="font-mono-tight text-[10px] text-zinc-500">
                          MESSAGE
                        </label>
                        <span
                          aria-live="polite"
                          className={`font-mono-tight text-[9px] tabular-nums ${message.length > 900 ? 'text-violet-300' : 'text-zinc-600'}`}
                        >
                          {String(message.length).padStart(3, '0')}/1000
                        </span>
                      </div>
                      <Textarea
                        id="signal-message"
                        name="message"
                        required
                        minLength={10}
                        maxLength={1000}
                        rows={5}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="The problem, the people affected, and what success looks like."
                        aria-invalid={Boolean(errors.message)}
                        className={`${inputClass} mt-2 min-h-[140px] py-3`}
                      />
                      {errors.message ? (
                        <p className="font-mono-tight mt-2 text-xs text-red-400/90">
                          {errors.message}
                        </p>
                      ) : null}
                    </div>

                    {status === 'error' ? (
                      <p className="font-mono-tight mt-6 text-xs text-red-400/90" role="alert">
                        TRANSMISSION FAILED — RETRY OR EMAIL DIRECTLY.
                      </p>
                    ) : null}

                    <div className="mt-8">
                      <PrimaryButton type="submit" disabled={status === 'sending'}>
                        {status === 'sending' ? (
                          <>
                            TRANSMITTING
                            <span className="inline-flex items-end gap-1" aria-hidden>
                              {[0, 150, 300].map((delay) => (
                                <span
                                  key={delay}
                                  className="size-1 animate-bounce rounded-full bg-violet-300"
                                  style={{ animationDelay: `${delay}ms` }}
                                />
                              ))}
                            </span>
                          </>
                        ) : (
                          'START A PROJECT →'
                        )}
                      </PrimaryButton>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </Reveal>
        </div>

        {/* ------------------------------ stats strip ------------------------------ */}
        <Reveal delay={0.1}>
          <div className="mt-14 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/5 pt-6">
            {STATS.map((stat, i) => (
              <Fragment key={stat}>
                {i > 0 ? (
                  <span aria-hidden className="font-mono-tight text-[10px] text-zinc-700">
                    ·
                  </span>
                ) : null}
                <span className="font-mono-tight text-[10px] text-zinc-500">{stat}</span>
              </Fragment>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
