'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'

import { PRINCIPLES, STORY, HUMAN_GALLERY } from '@/lib/portfolio-data'
import { Reveal, useCompanion } from '@/components/portfolio/kit'

/* ------------------------------------------------------------------ */
/* ACT 06 — THE HUMAN                                                  */
/* The deliberate slow-down: palette inverts to a calm light panel.    */
/* No effects, no parallax — the contrast itself is the design.        */
/* ------------------------------------------------------------------ */

export default function ActHuman() {
  const say = useCompanion((s) => s.say)
  const sectionRef = useRef<HTMLElement>(null)
  const saidRef = useRef(false)
  const [imgFailed, setImgFailed] = useState(false)

  const inView = useInView(sectionRef, { once: true, margin: '-25% 0px -25% 0px' })

  useEffect(() => {
    if (!inView || saidRef.current) return
    saidRef.current = true
    if (typeof window !== 'undefined' && window.innerWidth >= 640) {
      say("Enough systems. Here's the human part.")
    }
  }, [inView, say])

  return (
    <section
      id="human"
      ref={sectionRef}
      className="relative bg-[#ededed] text-zinc-900"
      aria-label="The human — about Elvin Omondi"
    >
      <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32 lg:py-40">
        {/* ------- inline header (light-mode variant of ActHeader) ------- */}
        <Reveal y={20}>
          <div className="flex items-center gap-4">
            <span className="font-mono-tight text-[10px] text-violet-700">ACT 06</span>
            <span
              className="h-px w-16 bg-gradient-to-r from-zinc-900/25 via-zinc-900/10 to-transparent"
              aria-hidden
            />
            <span className="font-mono-tight text-[10px] text-zinc-500">THE HUMAN</span>
          </div>
        </Reveal>
        <Reveal y={20} delay={0.08}>
          <h2 className="mt-6 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-7xl">
            Behind every system is a person who cares about building it well.
          </h2>
        </Reveal>

        {/* ------------------------- main split ------------------------- */}
        <div className="mt-14 grid items-start gap-10 sm:mt-16 lg:grid-cols-[5fr_7fr] lg:gap-16">
          {/* LEFT — portrait */}
          <Reveal y={20} delay={0.12}>
            <figure>
              <div className="overflow-hidden rounded-2xl border border-zinc-900/10 shadow-sm">
                {imgFailed ? (
                  <div className="flex aspect-[4/5] w-full flex-col items-center justify-center gap-6 bg-zinc-300">
                    <span
                      className="font-mono-tight select-none text-8xl leading-none text-zinc-900/20"
                      aria-hidden
                    >
                      EO
                    </span>
                    <span className="font-mono-tight text-[10px] text-zinc-500">
                      PORTRAIT LOADING…
                    </span>
                  </div>
                ) : (
                  <img
                    src="/images/elvin-portrait.jpg"
                    alt="Portrait of Elvin Omondi"
                    loading="lazy"
                    decoding="async"
                    onError={() => setImgFailed(true)}
                    className="aspect-[4/5] w-full object-cover grayscale"
                  />
                )}
              </div>
              <figcaption className="mt-4 flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono-tight text-[10px] text-zinc-500">
                  FIG. 01 — THE ENGINEER, CAFFEINATED
                </span>
                <span className="font-mono-tight text-[10px] text-zinc-500">NAIROBI · UTC+3</span>
              </figcaption>
            </figure>
          </Reveal>

          {/* RIGHT — story + principles */}
          <div>
            <div className="space-y-6">
              <Reveal y={20} delay={0.16}>
                <p className="text-base leading-relaxed text-zinc-700 sm:text-lg">
                  {STORY.origin}
                </p>
              </Reveal>
              <Reveal y={20} delay={0.2}>
                <p className="text-base leading-relaxed text-zinc-700 sm:text-lg">
                  {STORY.belief}
                </p>
              </Reveal>
              <Reveal y={20} delay={0.24}>
                <p className="text-base leading-relaxed text-zinc-700 sm:text-lg">{STORY.now}</p>
              </Reveal>
            </div>

            <Reveal y={20} delay={0.28}>
              <p className="font-mono-tight mt-8 text-xs text-violet-700">— ELVIN</p>
            </Reveal>

            {/* ---------------- photo mosaic — life outside the IDE --------------- */}
            <Reveal y={20} delay={0.3}>
              <div className="mt-14 flex items-center gap-4 border-t border-zinc-900/10 pt-8">
                <span className="font-mono-tight text-[10px] text-zinc-500">CONTEXT · WHERE THE WORK HAPPENS</span>
                <span
                  className="h-px flex-1 bg-gradient-to-r from-zinc-900/15 to-transparent"
                  aria-hidden
                />
              </div>
            </Reveal>
            <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {HUMAN_GALLERY.map((shot, i) => (
                <Reveal key={shot.src} y={20} delay={0.34 + i * 0.06} className={i === 0 ? 'col-span-2' : ''}>
                  <figure>
                    <div className="group overflow-hidden rounded-xl border border-zinc-900/10 shadow-sm">
                      <img
                        src={shot.src}
                        alt={shot.alt}
                        loading="lazy"
                        decoding="async"
                        className="aspect-[4/3] w-full object-cover saturate-[0.85] transition-all duration-700 group-hover:scale-[1.05] group-hover:saturate-100 motion-reduce:transition-none"
                      />
                    </div>
                    <figcaption className="font-mono-tight mt-2.5 text-[9px] text-zinc-500">
                      FIG. {String(i + 2).padStart(2, '0')} — {shot.caption}
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>

            {/* principles */}
            <Reveal y={20} delay={0.32}>
              <div className="mt-14 flex items-center gap-4 border-t border-zinc-900/10 pt-8">
                <span className="font-mono-tight text-[10px] text-zinc-500">PRINCIPLES</span>
                <span
                  className="h-px flex-1 bg-gradient-to-r from-zinc-900/15 to-transparent"
                  aria-hidden
                />
              </div>
            </Reveal>
            <div className="mt-8 grid gap-x-10 gap-y-10 sm:grid-cols-2">
              {PRINCIPLES.map((p, i) => (
                <Reveal key={p.n} y={20} delay={0.36 + i * 0.06}>
                  <div>
                    <span className="font-mono-tight text-[10px] text-violet-700">{p.n}</span>
                    <h3 className="mt-3 text-base font-semibold text-zinc-900">{p.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-600">{p.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
