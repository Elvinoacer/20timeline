'use client'

/* ------------------------------------------------------------------ */
/* StudioEnv — procedural studio lighting environment                  */
/*                                                                     */
/* Builds an environment map in-scene from drei <Lightformer> panels   */
/* (no external HDR fetches — the site works fully offline).           */
/* Violet-key + white-fill studio look tuned for chrome / glass PBR.   */
/* ------------------------------------------------------------------ */

import { Environment, Lightformer } from '@react-three/drei'

export default function StudioEnv({ intensity = 1 }: { intensity?: number }) {
  return (
    <Environment resolution={256} frames={1} background={false}>
      {/* violet key light — large soft panel top-left */}
      <Lightformer
        form="rect"
        intensity={3.2 * intensity}
        color="#8b5cf6"
        position={[-5, 3, 2]}
        rotation={[0, Math.PI / 4, 0]}
        scale={[8, 5, 1]}
      />
      {/* white fill — big overhead softbox */}
      <Lightformer
        form="rect"
        intensity={2.4 * intensity}
        color="#ffffff"
        position={[0, 6, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[10, 10, 1]}
      />
      {/* cool rim — back right strip */}
      <Lightformer
        form="rect"
        intensity={2.2 * intensity}
        color="#c4b5fd"
        position={[5, 1, -3]}
        rotation={[0, -Math.PI / 3, 0]}
        scale={[6, 3, 1]}
      />
      {/* faint warm bounce from below-front */}
      <Lightformer
        form="circle"
        intensity={1.1 * intensity}
        color="#f5f0ff"
        position={[0, -4, 3]}
        scale={[5, 5, 1]}
      />
      {/* thin accent strips for sharp specular streaks on metal */}
      <Lightformer form="rect" intensity={4 * intensity} color="#ffffff" position={[-2, 2, 5]} scale={[0.5, 4, 1]} />
      <Lightformer form="rect" intensity={3 * intensity} color="#a78bfa" position={[3, -1, 4]} scale={[0.4, 3, 1]} />
    </Environment>
  )
}
