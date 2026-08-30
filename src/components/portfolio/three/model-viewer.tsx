'use client'

/* ==========================================================================
   3D MODEL VIEWER — LAB experiment
   ========================================================================== */

import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Center, ContactShadows, OrbitControls, useGLTF, useProgress } from '@react-three/drei'
import { AnimatePresence, motion } from 'framer-motion'
import * as THREE from 'three'

import StudioEnv from './studio-env'
import { cn } from '@/lib/utils'

const VIOLET = '#8b5cf6'

type Asset = {
  id: string
  label: string
  url: string
  note: string
  spin: number
}

const ASSETS: Asset[] = [
  { id: 'helmet', label: 'HELMET', url: '/models/DamagedHelmet.glb', note: 'DAMAGED HELMET · PBR SHOWCASE', spin: 0.35 },
  { id: 'lantern', label: 'LANTERN', url: '/models/Lantern.glb', note: 'LANTERN · LOW-POLY PBR', spin: 0.3 },
  { id: 'boombox', label: 'BOOMBOX', url: '/models/BoomBox.glb', note: 'BOOMBOX · TEXTURE BAKE STUDY', spin: 0.5 },
  { id: 'bottle', label: 'BOTTLE', url: '/models/WaterBottle.glb', note: 'WATER BOTTLE · GLASS SHADING', spin: 0.45 },
  { id: 'car', label: 'TOY CAR', url: '/models/ToyCar.glb', note: 'TOY CAR · CLEARCOAT PAINT', spin: 0.55 },
]

const TARGET_SIZE = 2.2

function Model({ asset }: { asset: Asset }) {
  const { scene } = useGLTF(asset.url)
  const inner = useRef<THREE.Group>(null)
  const cloned = useMemo(() => scene.clone(true), [scene])

  useEffect(() => {
    const g = inner.current
    if (!g) return
    const box = new THREE.Box3().setFromObject(g)
    const size = box.getSize(new THREE.Vector3()).length()
    if (size > 0 && Number.isFinite(size)) {
      const s = TARGET_SIZE / size
      g.scale.setScalar(s)
      const box2 = new THREE.Box3().setFromObject(g)
      const midY = (box2.min.y + box2.max.y) / 2
      g.position.y = -midY
    }
  }, [cloned])

  return (
    <Center>
      <group ref={inner}>
        <primitive object={cloned} rotation={[0.1, asset.spin, 0]} />
      </group>
    </Center>
  )
}

function LoaderOverlay() {
  const { active, progress } = useProgress()
  return (
    <AnimatePresence>
      {active ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-[#070707]/80"
          role="status"
          aria-live="polite"
          aria-label={`Loading 3D model, ${Math.round(progress)} percent`}
        >
          <span className="font-mono-tight text-[10px] text-violet-300">
            LOADING ASSET · {Math.round(progress)}%
          </span>
          <div className="h-px w-40 overflow-hidden bg-white/10" aria-hidden="true">
            <motion.div
              className="h-full bg-violet-400 shadow-[0_0_10px_rgba(139,92,246,0.9)]"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            />
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

export default function ModelViewer() {
  const [current, setCurrent] = useState<Asset>(ASSETS[0]!)
  const [autoRotate, setAutoRotate] = useState(false)

  useEffect(() => {
    useGLTF.preload(ASSETS[0]!.url)
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    setAutoRotate(!reduced.matches)
  }, [])

  return (
    <div className="relative h-full w-full" aria-describedby="model-viewer-instructions">
      <p id="model-viewer-instructions" className="sr-only">
        Interactive 3D model viewer. Choose a model with the model buttons below. The visual canvas is decorative;
        drag with a mouse or touch to orbit, scroll or pinch to zoom, and use the motion button to pause or resume
        automatic rotation. The selected model description is announced below.
      </p>

      <Canvas
        aria-hidden="true"
        dpr={[1, 1.6]}
        camera={{ position: [0.4, 0.7, 4.4], fov: 40 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} intensity={22} color="#ffffff" />
        <pointLight position={[-5, -2, 3]} intensity={14} color={VIOLET} />
        <StudioEnv />

        <Suspense fallback={null}>
          <Model asset={current} />
          <ContactShadows
            position={[0, -1.45, 0]}
            opacity={0.6}
            scale={9}
            blur={2.6}
            far={3.4}
            color="#4c1d95"
          />
        </Suspense>

        <OrbitControls
          makeDefault
          autoRotate={autoRotate}
          autoRotateSpeed={0.72}
          enablePan={false}
          enableZoom
          minDistance={1.6}
          maxDistance={8}
          minPolarAngle={Math.PI / 5}
          maxPolarAngle={(Math.PI / 5) * 4}
          dampingFactor={0.08}
        />
      </Canvas>

      <LoaderOverlay />

      <div
        className="absolute left-4 right-4 top-3 z-20 flex items-start justify-between gap-3"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="pointer-events-none flex min-w-0 flex-col gap-1">
          <span className="font-mono-tight truncate text-[9px] text-violet-300/90">{current.note}</span>
          <span className="font-mono-tight text-[9px] text-zinc-500">
            DRAG TO ORBIT · SCROLL / PINCH TO ZOOM
          </span>
        </div>
        <button
          type="button"
          onClick={() => setAutoRotate((value) => !value)}
          aria-pressed={autoRotate}
          aria-label={autoRotate ? 'Pause automatic model rotation' : 'Resume automatic model rotation'}
          className={cn(
            'shrink-0 rounded-full border px-2.5 py-1.5 font-mono-tight text-[9px] backdrop-blur-md transition-colors',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300',
            autoRotate
              ? 'border-violet-400/50 bg-violet-500/10 text-violet-200'
              : 'border-white/15 bg-black/40 text-zinc-400'
          )}
        >
          {autoRotate ? 'PAUSE MOTION' : 'PLAY MOTION'}
        </button>
      </div>

      <div
        className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 flex-wrap justify-center gap-1.5 px-3"
        role="group"
        aria-label="Choose 3D model"
      >
        {ASSETS.map((asset) => (
          <button
            key={asset.id}
            type="button"
            aria-pressed={current.id === asset.id}
            aria-label={`Show ${asset.label.toLowerCase()} 3D model`}
            onClick={() => setCurrent(asset)}
            className={cn(
              'min-h-9 rounded-full border px-3 py-1.5 font-mono-tight text-[9px] backdrop-blur-md transition-all duration-300',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400',
              current.id === asset.id
                ? 'border-violet-400/60 bg-violet-500/20 text-violet-200 shadow-[0_0_16px_rgba(139,92,246,0.35)]'
                : 'border-white/15 bg-black/40 text-zinc-400 hover:border-violet-400/50 hover:text-violet-200'
            )}
          >
            {asset.label}
          </button>
        ))}
      </div>

      <p className="sr-only" aria-live="polite">
        Selected model: {current.note}. Automatic rotation is {autoRotate ? 'on' : 'off'}.
      </p>
    </div>
  )
}
