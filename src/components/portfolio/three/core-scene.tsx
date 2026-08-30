'use client'

/* ==========================================================================
   WebGL DIGITAL CORE — the Act 01 hero scene
   ========================================================================== */

import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshTransmissionMaterial, Sparkles } from '@react-three/drei'
import * as THREE from 'three'

import StudioEnv from './studio-env'
import { CameraRig, Rig, StarShell, useHaloTexture } from './pieces'

const VIOLET = '#8b5cf6'
const SOFT = '#c4b5fd'

function Core() {
  const shellRef = useRef<THREE.Mesh>(null)
  const heartRef = useRef<THREE.Mesh>(null)
  const haloRef = useRef<THREE.Sprite>(null)
  const pulseRef = useRef<THREE.Mesh>(null)
  const halo = useHaloTexture()

  const lite = useMemo(() => typeof window !== 'undefined' && window.innerWidth < 640, [])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const x = state.pointer.x
    const y = state.pointer.y

    if (shellRef.current) {
      shellRef.current.rotation.y = t * 0.12 + x * 0.08
      shellRef.current.rotation.x = Math.sin(t * 0.17) * 0.18 + y * 0.06
    }
    if (heartRef.current) {
      const breath = 1 + 0.05 * (Math.sin(t * 0.85) * 0.5 + 0.5)
      heartRef.current.scale.setScalar(breath)
      heartRef.current.position.x = x * 0.08
      heartRef.current.position.y = y * 0.05
    }
    if (haloRef.current) {
      const s = 5.2 + 0.35 * (Math.sin(t * 0.85) * 0.5 + 0.5)
      haloRef.current.scale.set(s, s, 1)
    }
    if (pulseRef.current) {
      const pulse = 1 + 0.08 * (Math.sin(t * 1.2) * 0.5 + 0.5)
      pulseRef.current.scale.setScalar(pulse)
      pulseRef.current.rotation.z = t * 0.18
      const material = pulseRef.current.material as THREE.MeshStandardMaterial
      material.opacity = 0.08 + 0.06 * (Math.sin(t * 1.2) * 0.5 + 0.5)
    }
  })

  return (
    <group>
      <sprite ref={haloRef} position={[0, 0, -1.2]} scale={[5.2, 5.2, 1]}>
        <spriteMaterial
          map={halo}
          transparent
          opacity={0.55}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>

      <mesh ref={pulseRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.95, 0.012, 8, 96]} />
        <meshStandardMaterial
          color={SOFT}
          emissive={VIOLET}
          emissiveIntensity={0.8}
          transparent
          opacity={0.1}
          metalness={0.4}
          roughness={0.2}
        />
      </mesh>

      <mesh ref={heartRef}>
        <sphereGeometry args={[0.78, 40, 40]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive={SOFT}
          emissiveIntensity={2.6}
          roughness={0.25}
          metalness={0}
        />
      </mesh>

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
            roughness={0.08}
            transmission={1}
            ior={1.45}
            chromaticAberration={0.32}
            anisotropicBlur={0.25}
            distortion={0.1}
            distortionScale={0.35}
            temporalDistortion={0.04}
            samples={6}
            resolution={384}
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

type RingCfg = {
  r: number
  tilt: [number, number, number]
  speed: number
  tube: number
  satellite: { size: number; emissive?: boolean; offset: number }
}

const RINGS: RingCfg[] = [
  { r: 2.3, tilt: [Math.PI / 2.25, 0.35, 0], speed: 0.24, tube: 0.016, satellite: { size: 0.075, offset: 0 } },
  { r: 2.9, tilt: [Math.PI / 2.6, -0.5, 0.2], speed: -0.16, tube: 0.013, satellite: { size: 0.1, emissive: true, offset: 2.2 } },
  { r: 3.55, tilt: [Math.PI / 1.85, 0.8, -0.15], speed: 0.1, tube: 0.011, satellite: { size: 0.06, offset: 4.4 } },
]

function OrbitRings() {
  const groupRefs = useRef<(THREE.Group | null)[]>([])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    groupRefs.current.forEach((g, i) => {
      if (!g) return
      g.rotation.y = t * RINGS[i]!.speed + RINGS[i]!.satellite.offset
    })
  })

  return (
    <group>
      {RINGS.map((ring, i) => (
        <group key={ring.r} rotation={ring.tilt}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[ring.r, ring.tube, 10, 96]} />
            <meshStandardMaterial
              color="#d8ccf5"
              metalness={1}
              roughness={0.22}
              envMapIntensity={1.5}
            />
          </mesh>
          <group ref={(el) => { groupRefs.current[i] = el }}>
            <mesh position={[ring.r, 0, 0]}>
              <icosahedronGeometry args={[ring.satellite.size, 0]} />
              {ring.satellite.emissive ? (
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

function Monoliths() {
  return (
    <group>
      <Float speed={1.4} rotationIntensity={0.55} floatIntensity={1.3}>
        <mesh position={[-4.4, 1.9, -3.2]} rotation={[0.6, 0.4, 0.2]}>
          <torusKnotGeometry args={[0.52, 0.16, 96, 16]} />
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

export default function CoreScene({ active = true }: { active?: boolean }) {
  return (
    <Canvas
      frameloop={active ? 'always' : 'never'}
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 9], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ background: 'transparent' }}
    >
      <CameraRig enabled={active} />
      <ambientLight intensity={0.35} />
      <pointLight position={[6, 4, 6]} intensity={26} color="#ffffff" />
      <pointLight position={[-6, -2, 4]} intensity={18} color={VIOLET} />
      <StudioEnv />
      <Rig amount={0.12} depth={0.018}>
        <Core />
        <OrbitRings />
        <StarShell count={typeof window !== 'undefined' && window.innerWidth < 640 ? 240 : 520} speed={0.03} />
        <Monoliths />
        <Sparkles count={52} scale={[9, 6, 4]} size={2.2} speed={0.26} color={SOFT} opacity={0.5} />
      </Rig>
    </Canvas>
  )
}
