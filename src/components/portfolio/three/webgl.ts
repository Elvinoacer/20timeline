/* ------------------------------------------------------------------ */
/* WebGL capability detection — shared by every 3D scene               */
/* ------------------------------------------------------------------ */

let cached: boolean | null = null

export function webglSupported(): boolean {
  if (cached !== null) return cached
  if (typeof window === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl')
    cached = !!gl
  } catch {
    cached = false
  }
  return cached
}
