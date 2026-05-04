/**
 * Generate matcap textures for loaders
 * Creates primary (white), secondary (gold), and tertiary (blue) matcaps
 */

import { createCanvas } from 'canvas'
import fs from 'fs'
import path from 'path'

const OUTPUT_DIR = path.join(process.cwd(), 'public/assets/textures/matcaps')

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
}

function createMatcapTexture(baseColor, highlightColor, shadowColor) {
  const canvas = createCanvas(512, 512)
  const ctx = canvas.getContext('2d')

  // Fill with base color
  ctx.fillStyle = baseColor
  ctx.fillRect(0, 0, 512, 512)

  // Create a radial gradient for sphere-like appearance
  const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 362)
  gradient.addColorStop(0, highlightColor)
  gradient.addColorStop(0.5, 'rgba(200, 200, 200, 0.2)')
  gradient.addColorStop(1, shadowColor)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 512, 512)

  // Add a bright specular highlight
  const specularGradient = ctx.createRadialGradient(180, 180, 0, 180, 180, 120)
  specularGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)')
  specularGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)')
  specularGradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
  ctx.fillStyle = specularGradient
  ctx.fillRect(60, 60, 240, 240)

  return canvas
}

// Generate Primary (White)
const primaryCanvas = createMatcapTexture(
  '#f0f0f0',
  'rgba(255, 255, 255, 0.6)',
  'rgba(40, 40, 40, 0.4)'
)
const primaryBuffer = primaryCanvas.toBuffer('image/png')
fs.writeFileSync(path.join(OUTPUT_DIR, 'primary.png'), primaryBuffer)
console.log('✓ Generated primary.png')

// Generate Secondary (Gold)
const secondaryCanvas = createMatcapTexture(
  '#d4af37',
  'rgba(255, 255, 200, 0.6)',
  'rgba(100, 80, 0, 0.4)'
)
const secondaryBuffer = secondaryCanvas.toBuffer('image/png')
fs.writeFileSync(path.join(OUTPUT_DIR, 'secondary.png'), secondaryBuffer)
console.log('✓ Generated secondary.png')

// Generate Tertiary (Blue)
const tertiaryCanvas = createMatcapTexture(
  '#4a90e2',
  'rgba(150, 200, 255, 0.6)',
  'rgba(20, 40, 100, 0.4)'
)
const tertiaryBuffer = tertiaryCanvas.toBuffer('image/png')
fs.writeFileSync(path.join(OUTPUT_DIR, 'tertiary.png'), tertiaryBuffer)
console.log('✓ Generated tertiary.png')

console.log(`\nMatcap textures generated in ${OUTPUT_DIR}`)
