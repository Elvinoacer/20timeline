import { CONTACT, PIPELINE, PRINCIPLES, PROJECTS, STACK_ITEMS, STORY } from '@/lib/portfolio-data'

/* ------------------------------------------------------------------ */
/* ResumeSheet — PRINT-ONLY dossier (hidden on screen).                */
/* `resume` console command / signal-act button → window.print() and   */
/* this becomes a clean, ink-friendly one-pager (Save as PDF works).   */
/* Server component: zero JS, zero hooks.                              */
/* ------------------------------------------------------------------ */

const GROUPS = Array.from(new Set(STACK_ITEMS.map((i) => i.group)))

export default function ResumeSheet() {
  const top = [...STACK_ITEMS].sort((a, b) => b.level - a.level).slice(0, 8)

  return (
    <div className="print-root">
      <header className="print-header">
        <div>
          <h1>ELVIN OMONDI</h1>
          <p className="print-role">Software Engineer &amp; Digital Product Builder</p>
        </div>
        <div className="print-contact">
          <p>{CONTACT.email}</p>
          <p>{CONTACT.location}</p>
          <p>github.com/elvinomondi · linkedin.com/in/elvinomondi</p>
        </div>
      </header>

      <section>
        <h2>PROFILE</h2>
        <p className="print-body">{STORY.belief}</p>
      </section>

      <section>
        <h2>SELECTED SYSTEMS</h2>
        {PROJECTS.map((p) => (
          <article key={p.id} className="print-project">
            <div className="print-project-head">
              <strong>{p.name}</strong>
              <span>
                {p.domain} · {p.year}
              </span>
            </div>
            <p className="print-body">{p.tagline} {p.result}</p>
            <p className="print-metrics">
              {p.metrics.map((m) => `${m.k}: ${m.v}`).join('  ·  ')}
            </p>
          </article>
        ))}
      </section>

      <section>
        <h2>CORE STACK</h2>
        <p className="print-body">
          {top.map((t) => `${t.name} (${t.level}%)`).join('  ·  ')}
        </p>
        <p className="print-body print-dim">
          Full inventory: {GROUPS.join(' · ')} — interactive dossier at elvinomondi.dev/#stack
        </p>
      </section>

      <section>
        <h2>HOW I WORK</h2>
        <p className="print-body">{PIPELINE.map((s) => s.key).join(' → ')}</p>
        <ul className="print-principles">
          {PRINCIPLES.map((p) => (
            <li key={p.n}>
              <strong>{p.title}.</strong> {p.body}
            </li>
          ))}
        </ul>
      </section>

      <footer className="print-foot">
        Generated from elvinomondi.dev — the operable portfolio. © 2026 Elvin Omondi.
      </footer>
    </div>
  )
}
