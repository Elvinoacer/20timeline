'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'

import Preloader from '@/components/portfolio/preloader'
import CustomCursor from '@/components/portfolio/cursor'
import SiteNav from '@/components/portfolio/nav'
import Companion from '@/components/portfolio/companion'
import SiteFooter from '@/components/portfolio/footer'
import CommandConsole from '@/components/portfolio/console'
import KeyboardShortcuts from '@/components/portfolio/shortcuts'
import ActHud from '@/components/portfolio/act-hud'
import { ActDivider } from '@/components/portfolio/kit'

import ActEntry from '@/components/portfolio/act-entry'
import ActEngine from '@/components/portfolio/act-engine'
import ActPipeline from '@/components/portfolio/act-pipeline'
import ActProjects from '@/components/portfolio/act-projects'
import ActLab from '@/components/portfolio/act-lab'
import ActHuman from '@/components/portfolio/act-human'
import ActStack from '@/components/portfolio/act-stack'
import ActSignal from '@/components/portfolio/act-signal'
import ResumeSheet from '@/components/portfolio/resume-sheet'

export default function Home() {
  const [booted, setBooted] = useState(false)

  /* EO-7 console `reboot` command replays the boot sequence */
  useEffect(() => {
    const onReboot = () => setBooted(false)
    window.addEventListener('eo:reboot', onReboot)
    return () => window.removeEventListener('eo:reboot', onReboot)
  }, [])

  /* announce boot completion — deep links (#project-*) activate after the preloader */
  useEffect(() => {
    if (!booted) return
    window.dispatchEvent(new CustomEvent('eo:booted'))
  }, [booted])

  /* JSON-LD — structured data for search engines */
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Elvin Omondi',
    jobTitle: 'Software Engineer & Digital Product Builder',
    url: 'https://elvinomondi.dev',
    email: 'mailto:hello@elvinomondi.dev',
    address: { '@type': 'PostalAddress', addressLocality: 'Nairobi', addressCountry: 'KE' },
    sameAs: ['https://github.com/elvinomondi', 'https://linkedin.com/in/elvinomondi', 'https://x.com/elvinomondi'],
    knowsAbout: ['Web Development', 'Mobile Development', 'Desktop Applications', 'Systems Engineering', 'Realtime Systems'],
  }

  return (
    <div className="portfolio-root relative flex min-h-screen flex-col font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <AnimatePresence>{!booted && <Preloader onDone={() => setBooted(true)} />}</AnimatePresence>

      <CustomCursor />
      <SiteNav booted={booted} />
      <Companion />
      <CommandConsole />
      <KeyboardShortcuts />
      <ActHud booted={booted} />

      {/* skip link for keyboard users */}
      <a
        href="#entry"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[200] focus:rounded-md focus:bg-violet-600 focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>

      <main id="main" className="relative flex-1">
        <ActEntry booted={booted} />
        <ActDivider done="ACT-01" next="ACT-02" />
        <ActEngine />
        <ActDivider done="ACT-02" next="ACT-03" />
        <ActPipeline />
        <ActDivider done="ACT-03" next="ACT-04" />
        <ActProjects />
        <ActDivider done="ACT-04" next="ACT-05" />
        <ActLab />
        <ActDivider done="ACT-05" next="ACT-06" />
        <ActHuman />
        <ActDivider done="ACT-06" next="ACT-07" />
        <ActStack />
        <ActDivider done="ACT-07" next="ACT-08" />
        <ActSignal />
      </main>

      <SiteFooter />

      {/* print-only dossier — `resume` console command or signal-act button prints it */}
      <ResumeSheet />
    </div>
  )
}
