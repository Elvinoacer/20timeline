'use client'

/* ------------------------------------------------------------------ */
/* Shared R3F building blocks used by multiple 3D scenes               */
/* ------------------------------------------------------------------ */

import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const VIOLET = '#8b5cf6'
const SOFT = '#c4b5fd'

type RigProps = {
  children: React.ReactNode
  amount?: number
  depth?: number
}

/* ------------------------------------------------------------------ */
/* Rig — scoped pointer parallax + subtle idle drift                    */
/* ------------------------------------------------------------------ */

export function Rig({ children, amount = 0.16, depth = 0.025 }: RigProps) {
  const ref = useRef<THREE.Group>(null)
  const target = useRef({ x: 0, y: 0 })

  useFrame((state, delta) => {
    if (!ref.current) return

    const k = 1 - Math.pow(0.001, delta)
    target.current.x = state.pointer.x
    target.current.y = state.pointer.y

    ref.current.rotation.y += (target.current.x * amount - ref.current.rotation.y) * k
    ref.current.rotation.x += (target.current.y * amount * 0.62 - ref.current.rotation.x) * k
    ref.current.position.x += (target.current.x * depth - ref.current.position.x) * k
    ref.current.position.y += (target.current.y * depth * 0.62 - ref.current.position.y) * k
  })

  return <group ref={ref}>{children}</group>
}

/* ------------------------------------------------------------------ */
/* CameraRig — gentle camera response makes the scene feel deeper       */
/* ------------------------------------------------------------------ */

export function CameraRig({ enabled = true }: { enabled?: boolean }) {
  const target = useMemo(() => new THREE.Vector3(), [])

  useFrame(({ camera, pointer }, delta) => {
    if (!enabled) return
    const k = 1 - Math.pow(0.001, delta)
    target.set(pointer.x * 0.42, pointer.y * 0.22, 9)
    camera.position.lerp(target, k)
    camera.lookAt(0, 0, 0)
  })

  return null
}

/* ------------------------------------------------------------------ */
/* StarShell — violet starfield in a squashed spherical shell          */
/* ------------------------------------------------------------------ */

export function StarShell({ count = 420, speed = 0.03 }: { count?: number; speed?: number }) {
  const ref = useRef<THREE.Points>(null)

  const { geometry, material } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const violet = new THREE.Color(VIOLET)
    const soft = new THREE.Color(SOFT)
    const white = new THREE.Color('#ffffff')

    for (let i = 0; i < count; i++) {
      const r = 2.6 + Math.random() * 3.6
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.cos(phi) * 0.72
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)

      const roll = Math.random()
      const c = roll < 0.08 ? white : roll < 0.3 ? violet : soft
      colors[i * 3] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const material = new THREE.PointsMaterial({
      size: 0.035,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    })
    return { geometry, material }
  }, [count])

  useEffect(() => {
    return () => {
      geometry.dispose()
      material.dispose()
    }
  }, [geometry, material])

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    ref.current.rotation.y = t * speed
    ref.current.rotation.x = Math.sin(t * 0.11) * 0.05
  })

  return <points ref={ref} geometry={geometry} material={material} />
}

/* ------------------------------------------------------------------ */
/* useHaloTexture — radial-gradient glow sprite                         */
/* ------------------------------------------------------------------ */

export function useHaloTexture() {
  const texture = useMemo(() => {
    const size = 256
    const cv = document.createElement('canvas')
    cv.width = size
    cv.height = size
    const ctx = cv.getContext('2d')!
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
    g.addColorStop(0, 'rgba(196,181,253,0.85)')
    g.addColorStop(0.25, 'rgba(139,92,246,0.38)')
    g.addColorStop(0.6, 'rgba(139,92,246,0.10)')
    g.addColorStop(1, 'rgba(139,92,246,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, size, size)
    const tex = new THREE.CanvasTexture(cv)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [])

  useEffect(() => () => texture.dispose(), [texture])

  return texture
}
