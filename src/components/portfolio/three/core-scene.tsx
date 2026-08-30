'use client'

/* ==========================================================================
   WebGL DIGITAL CORE — the Act 01 hero scene
   --------------------------------------------------------------------------
   A premium PBR reimagining of the original Canvas2D orb:
     · faceted crystal core (MeshTransmissionMaterial, chromatic dispersion)
     · white-hot emissive heart + additive radial halo sprite
     · three chrome orbit rings with satellite spheres
     · 420-particle violet starfield shell + drei Sparkles
     · floating chrome monoliths (torus knot / octahedron)
     · pointer-parallax rig, IntersectionObserver-driven frameloop

   Reduced-motion users never mount this — ActEntry keeps the static
   Canvas2D frame as the graceful fallback (also used if WebGL fails).
   ========================================================================== */

import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshTransmissionMaterial, Sparkles } from '@react-three/drei'
import * as THREE from 'three'

import StudioEnv from './studio-env'
import { Rig, StarShell, useHaloTexture } from './pieces'

const VIOLET = '#8b5cf6'
const SOFT = '#c4b5fd'

/* ------------------------------------------------------------------ */
/* the core itself: heart + crystal shell + halo                       */
/* ------------------------------------------------------------------ */

function Core() {
  const shellRef = useRef<THREE.Mesh>(null)
  const heartRef = useRef<THREE.Mesh>(null)
  const haloRef = useRef<THREE.Sprite>(null)
  const halo = useHaloTexture()

  const lite = useMemo(
    () => typeof window !== 'undefined' && window.innerWidth < 640,
    []
  )

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (shellRef.current) {
      shellRef.current.rotation.y = t * 0.12
      shellRef.current.rotation.x = Math.sin(t * 0.17) * 0.18
    }
    if (heartRef.current) {
      // breathing heart, echoes the original orb's breath cycle
      const s = 1 + 0.05 * (Math.sin(t * 0.85) * 0.5 + 0.5)
      heartRef.current.scale.setScalar(s)
    }
    if (haloRef.current) {
      const s = 5.2 + 0.35 * (Math.sin(t * 0.85) * 0.5 + 0.5)
      haloRef.current.scale.set(s, s, 1)
    }
  })

  return (
    <group>
      {/* additive halo sprite behind everything */}
      <sprite ref={haloRef} position={[0, 0, -1.2]} scale={[5.2, 5.2, 1]}>
        <spriteMaterial
          map={halo}
          transparent
          opacity={0.55}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>

      {/* white-hot heart */}
      <mesh ref={heartRef}>
        <sphereGeometry args={[0.78, 48, 48]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive={SOFT}
          emissiveIntensity={2.6}
          roughness={0.25}
          metalness={0}
        />
      </mesh>

      {/* faceted crystal shell */}
      <mesh ref={shellRef}>
        <icosahedronGeometry args={[1.55, 1]} />
        {lite ? (
          <meshStandardMaterial
            color={VIOLET}
            metalness={0.9}
            roughness={0.22}
            envMapIntensity={1.4}
            transparent
            opacity={0.92}
          />
        ) : (
          <MeshTransmissionMaterial
            thickness={1.1}
            roughness={0.07}
            transmission={1}
            ior={1.45}
            chromaticAberration={0.4}
            anisotropicBlur={0.35}
            distortion={0.12}
            distortionScale={0.4}
            temporalDistortion={0.06}
            samples={8}
            resolution={512}
            backside
            color="#e9ddff"
            attenuationColor={VIOLET}
            attenuationDistance={2.6}
          />
        )}
      </mesh>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* chrome orbit rings + satellites                                     */
/* ------------------------------------------------------------------ */

type RingCfg = {
  r: number
  tilt: [number, number, number]
  speed: number
  tube: number
  satellite?: { size: number; emissive?: boolean; offset: number }
}

const RINGS: RingCfg[] = [
  {
    r: 2.3,
    tilt: [Math.PI / 2.25, 0.35, 0],
    speed: 0.24,
    tube: 0.016,
    satellite: { size: 0.075, offset: 0 },
  },
  {
    r: 2.9,
    tilt: [Math.PI / 2.6, -0.5, 0.2],
    speed: -0.16,
    tube: 0.013,
    satellite: { size: 0.1, emissive: true, offset: 2.2 },
  },
  {
    r: 3.55,
    tilt: [Math.PI / 1.85, 0.8, -0.15],
    speed: 0.1,
    tube: 0.011,
    satellite: { size: 0.06, offset: 4.4 },
  },
]

function OrbitRings() {
  const groupRefs = useRef<(THREE.Group | null)[]>([])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    groupRefs.current.forEach((g, i) => {
      if (!g) return
      // ring plane spins around its local Y so satellites travel the ring
      g.rotation.y = t * RINGS[i]!.speed + RINGS[i]!.satellite!.offset
    })
  })

  return (
    <group>
      {RINGS.map((ring, i) => (
        <group key={i} rotation={ring.tilt}>
          {/* static chrome ring */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[ring.r, ring.tube, 12, 128]} />
            <meshStandardMaterial
              color="#d8ccf5"
              metalness={1}
              roughness={0.22}
              envMapIntensity={1.5}
            />
          </mesh>
          {/* orbiting satellite */}
          <group ref={(el) => { groupRefs.current[i] = el }}>
            <mesh position={[ring.r, 0, 0]}>
              <icosahedronGeometry args={[ring.satellite!.size, 0]} />
              {ring.satellite!.emissive ? (
                <meshStandardMaterial
                  color={VIOLET}
                  emissive={VIOLET}
                  emissiveIntensity={2.2}
                  roughness={0.3}
                />
              ) : (
                <meshStandardMaterial
                  color="#ffffff"
                  metalness={1}
                  roughness={0.15}
                  envMapIntensity={1.8}
                />
              )}
            </mesh>
          </group>
        </group>
      ))}
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* floating chrome monoliths — depth furniture in the background       */
/* ------------------------------------------------------------------ */

function Monoliths() {
  return (
    <group>
      <Float speed={1.4} rotationIntensity={0.55} floatIntensity={1.3}>
        <mesh position={[-4.4, 1.9, -3.2]} rotation={[0.6, 0.4, 0.2]}>
          <torusKnotGeometry args={[0.52, 0.16, 128, 20]} />
          <meshStandardMaterial color="#b7a5ec" metalness={1} roughness={0.16} envMapIntensity={1.6} />
        </mesh>
      </Float>
      <Float speed={1.1} rotationIntensity={0.7} floatIntensity={1.6}>
        <mesh position={[4.6, -1.6, -2.8]} rotation={[0.4, 0.9, 0.3]}>
          <octahedronGeometry args={[0.62, 0]} />
          <meshStandardMaterial color="#d8ccf5" metalness={1} roughness={0.12} envMapIntensity={1.7} />
        </mesh>
      </Float>
      <Float speed={0.9} rotationIntensity={0.4} floatIntensity={1.1}>
        <mesh position={[3.6, 2.5, -4.4]} rotation={[0.2, 0.5, 0.6]}>
          <capsuleGeometry args={[0.22, 0.65, 8, 20]} />
          <meshStandardMaterial color="#9f7be0" metalness={1} roughness={0.2} envMapIntensity={1.4} />
        </mesh>
      </Float>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* exported canvas wrapper                                             */
/* ------------------------------------------------------------------ */

export default function CoreScene({ active = true }: { active?: boolean }) {
  return (
    <Canvas
      frameloop={active ? 'always' : 'never'}
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 9], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.35} />
      <pointLight position={[6, 4, 6]} intensity={26} color="#ffffff" />
      <pointLight position={[-6, -2, 4]} intensity={18} color={VIOLET} />
      <StudioEnv />
      <Rig>
        <Core />
        <OrbitRings />
        <StarShell />
        <Monoliths />
        <Sparkles count={70} scale={[9, 6, 4]} size={2.2} speed={0.32} color={SOFT} opacity={0.55} />
      </Rig>
    </Canvas>
  )
}
