# ELVIN OMONDI — "Inside the Mind of a Software Engineer"

A cinematic, scroll-driven single-page portfolio. The website itself is the strongest
project: a booting system, a **real-time WebGL digital core**, eight narrative acts,
**field photography for every project**, interactive lab experiments (including a
live glTF PBR model viewer), a command console, keyboard shortcuts, shareable
project deep links, a printable PDF dossier, and a working contact pipeline.

## Stack

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS 4** + shadcn/ui components
- **framer-motion** — scroll narrative, beats, micro-interactions
- **Three.js + @react-three/fiber + drei** — real WebGL 3D (hero core, stack
  constellation, glTF model viewer) with a Canvas 2D fallback for reduced motion
- **zustand** — EO-7 companion message bus
- **Prisma + SQLite** — contact signal storage
- Canvas 2D — lab particle field + accessibility fallbacks

## Run locally

```bash
bun install            # or npm install
cp .env.example .env   # if needed: DATABASE_URL="file:./db/custom.db"
bun run db:push        # create SQLite schema
bun run dev            # http://localhost:3000
```

## Build for production

```bash
bun run build
bun run start
```

## Map of the experience

| Act | Section | File |
|-----|------------------|----------------------------------------------|
| 01 | THE ENTRY — boot sequence, **WebGL digital core**, scroll narrative | `src/components/portfolio/act-entry.tsx` |
| 02 | THE ENGINE — Web / Mobile / Desktop / Systems, **photo-backed cards** | `act-engine.tsx` |
| 03 | THE PIPELINE — Problem → Understand → Design → Engineer → Ship | `act-pipeline.tsx` |
| 04 | THE WORK — projects told as systems + **field-footage galleries** | `act-projects.tsx` |
| 05 | THE LAB — 4 interactive experiments + **real glTF PBR model viewer** | `act-lab.tsx` |
| 06 | THE HUMAN — story, principles, portrait, **photo mosaic** | `act-human.tsx` |
| 07 | THE STACK — operable tech inventory + **WebGL orbit scene** | `act-stack.tsx` |
| 08 | THE SIGNAL — contact form → `/api/contact` → SQLite | `act-signal.tsx` |

Shared design system + primitives: `src/components/portfolio/kit.tsx`
**3D scenes (`src/components/portfolio/three/`):** `core-scene.tsx` (hero crystal
core with transmission material, chrome rings, starfield), `model-viewer.tsx`
(EXP-05 — five switchable Khronos glTF models, orbit controls, auto-fit bounds),
`orbit-scene.tsx` (Act 07 constellation), `studio-env.tsx` (procedural studio
lighting — no external HDR fetches, works offline), `pieces.tsx` (parallax rig,
starfield), `webgl.ts` (capability detection + Canvas2D fallbacks).
Chrome: preloader, custom cursor, nav, EO-7 companion, act rail (`act-hud.tsx`),
EO-7 command console (`console.tsx` — ⌘K / Ctrl+K / backtick; try `help`),
operator manual (`shortcuts.tsx` — press `?`; number keys 1–8 jump between acts),
print dossier (`resume-sheet.tsx` — `resume` command or the signal-act button prints
a clean one-page PDF résumé; projects are deep-linkable via `#project-<id>`)
All content/copy: `src/lib/portfolio-data.ts`

## Make it yours

1. Replace the copy in `src/lib/portfolio-data.ts` (projects, stack dossier levels/notes, principles, story, gallery captions).
2. Swap `public/images/elvin-portrait.jpg` with your own photograph (grayscale, 4:5).
3. Replace any gallery image in `public/images/{engine,projects,human}` — keep the same filenames (or update `portfolio-data.ts`).
4. Drop your own GLB files into `public/models/` and register them in `ASSETS` inside `src/components/portfolio/three/model-viewer.tsx`.
5. Update email/socials in `CONTACT` (same data file) and `layout.tsx` metadata.
6. Tune the signature accent (electric violet `#8b5cf6`) in `src/app/globals.css`.

## Asset credits

- **3D models** — Khronos glTF Sample Models (`public/models/`):
  DamagedHelmet, Lantern, BoomBox, WaterBottle, ToyCar — CC-BY 4.0 / CC0, © their
  respective authors (see <https://github.com/KhronosGroup/glTF-Sample-Models>).
- **Photography** — web-sourced stock imagery bundled in `public/images/`.
- **Lighting** — the studio environment is generated procedurally in-scene
  (`Lightformer` panels), so the site needs no external HDR downloads.

## Accessibility & performance

- `prefers-reduced-motion` respected everywhere (static frames, no loops).
- Canvas rAF paused when offscreen / tab hidden; DPR capped at 2; particle counts halved on mobile.
- Semantic sections, aria labels/live regions, keyboard-operable toggles, skip link.
- Custom cursor only on fine pointers; native cursor kept on text inputs.
