'use client'

/* ==========================================================================
   STACK CONSTELLATION — Act 07 orbit scene
   ========================================================================== */

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Sparkles } from '@react-three/drei'
import { useReducedMotion } from 'framer-motion'
import * as THREE from 'three'

import StudioEnv from './studio-env'
import { CameraRig, Rig, useHaloTexture } from './pieces'

const VIOLET = '#8b5cf6'
const SOFT = '#c4b5fd'

function Heart() {
  const heartRef = useRef<THREE.Mesh>(null)
  const haloRef = useRef<THREE.Sprite>(null)
  const pulseRef = useRef<THREE.Mesh>(null)
  const halo = useHaloTexture()

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const x = state.pointer.x
    const y = state.pointer.y

    if (heartRef.current) {
      const s = 1 + 0.06 * (Math.sin(t * 1.1) * 0.5 + 0.5)
      heartRef.current.scale.setScalar(s)
      heartRef.current.position.x = x * 0.05
      heartRef.current.position.y = y * 0.04
    }
    if (haloRef.current) {
      const s = 3.4 + 0.25 * (Math.sin(t * 1.1) * 0.5 + 0.5)
      haloRef.current.scale.set(s, s, 1)
    }
    if (pulseRef.current) {
      const p = 1 + 0.06 * (Math.sin(t * 0.9) * 0.5 + 0.5)
      pulseRef.current.scale.setScalar(p)
      pulseRef.current.rotation.x = t * 0.12
      pulseRef.current.rotation.y = -t * 0.16
    }
  })

  return (
    <group>
      <sprite ref={haloRef} position={[0, 0, -0.6]} scale={[3.4, 3.4, 1]}>
        <spriteMaterial map={halo} transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} />
      </sprite>
      <mesh ref={pulseRef}>
        <icosahedronGeometry args={[0.84, 1]} />
        <meshBasicMaterial color={VIOLET} wireframe transparent opacity={0.11} />
      </mesh>
      <mesh ref={heartRef}>
        <icosahedronGeometry args={[0.5, 2]} />
        <meshStandardMaterial color="#ffffff" emissive={SOFT} emissiveIntensity={2.4} roughness={0.3} />
      </mesh>
      <mesh scale={0.78}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color="#d8ccf5" metalness={1} roughness={0.18} envMapIntensity={1.6} transparent opacity={0.28} />
      </mesh>
    </group>
  )
}

type BandCfg = { r: number; tilt: [number, number, number]; speed: number; sats: number }

const BANDS: BandCfg[] = [
  { r: 1.5, tilt: [Math.PI / 2.1, 0.2, 0], speed: 0.42, sats: 3 },
  { r: 2.15, tilt: [Math.PI / 2.5, -0.45, 0.15], speed: -0.3, sats: 4 },
  { r: 2.8, tilt: [Math.PI / 1.8, 0.65, -0.2], speed: 0.22, sats: 5 },
  { r: 3.45, tilt: [Math.PI / 2.35, 0.1, 0.35], speed: -0.16, sats: 4 },
]

const SAT_GEOMS = ['octa', 'capsule', 'box', 'tetra'] as const

function Satellite({ band, i }: { band: BandCfg; i: number }) {
  const kind = SAT_GEOMS[i % SAT_GEOMS.length]!
  const size = 0.07 + ((i * 37) % 11) * 0.011
  const emissive = i % 5 === 0

  return (
    <mesh position={[band.r, 0, 0]} rotation={[i * 0.7, i * 1.1, 0]}>
      {kind === 'octa' ? (
        <octahedronGeometry args={[size, 0]} />
      ) : kind === 'capsule' ? (
        <capsuleGeometry args={[size * 0.6, size * 1.4, 4, 12]} />
      ) : kind === 'box' ? (
        <boxGeometry args={[size * 1.6, size * 1.6, size * 1.6]} />
      ) : (
        <tetrahedronGeometry args={[size * 1.3, 0]} />
      )}
      {emissive ? (
        <meshStandardMaterial color={VIOLET} emissive={VIOLET} emissiveIntensity={2} roughness={0.35} />
      ) : (
        <meshStandardMaterial color="#e2d9fa" metalness={1} roughness={0.15} envMapIntensity={1.7} />
      )}
    </mesh>
  )
}

function Bands() {
  const spinners = useRef<(THREE.Group | null)[]>([])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    spinners.current.forEach((g, i) => {
      if (!g) return
      g.rotation.y = t * BANDS[i]!.speed + i * 1.7
    })
  })

  return (
    <group>
      {BANDS.map((band, i) => (
        <group key={i} rotation={band.tilt}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[band.r, 0.006, 8, 96]} />
            <meshBasicMaterial color={SOFT} transparent opacity={0.18} />
          </mesh>
          <group ref={(el) => { spinners.current[i] = el }}>
            {Array.from({ length: band.sats }, (_, s) => (
              <Satellite key={s} band={band} i={i * 3 + s} />
            ))}
          </group>
        </group>
      ))}
    </group>
  )
}

export default function OrbitScene({ active = true }: { active?: boolean }) {
  const reduced = useReducedMotion() ?? false
  const animate = active && !reduced

  return (
    <Canvas
      frameloop={animate ? 'always' : 'never'}
      dpr={[1, 1.5]}
      camera={{ position: [0, 1.4, 6.4], fov: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ background: 'transparent' }}
    >
      <CameraRig enabled={animate} />
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 4, 5]} intensity={20} color="#ffffff" />
      <pointLight position={[-5, -3, 3]} intensity={14} color={VIOLET} />
      <StudioEnv intensity={0.85} />
      <Rig amount={0.08} depth={0.014}>
        <Heart />
        <Bands />
        <Float speed={1.2} rotationIntensity={0.5} floatIntensity={1.2}>
          <mesh position={[-3.9, 1.4, -2.6]} rotation={[0.7, 0.3, 0.2]}>
            <torusKnotGeometry args={[0.34, 0.1, 96, 14]} />
            <meshStandardMaterial color="#b7a5ec" metalness={1} roughness={0.16} envMapIntensity={1.6} />
          </mesh>
        </Float>
        <Float speed={0.9} rotationIntensity={0.6} floatIntensity={1.4}>
          <mesh position={[4.1, -1.2, -2.2]} rotation={[0.3, 0.8, 0.4]}>
            <octahedronGeometry args={[0.42, 0]} />
            <meshStandardMaterial color="#d8ccf5" metalness={1} roughness={0.12} envMapIntensity={1.7} />
          </mesh>
        </Float>
        <Sparkles count={36} scale={[9, 4.5, 3]} size={1.8} speed={0.24} color={SOFT} opacity={0.5} />
      </Rig>
    </Canvas>
  )
}
