/**
 * Create matcap textures locally using pngjs
 * Generates primary (white), secondary (gold), and tertiary (blue) matcaps
 */

import { PNG } from 'pngjs'
import fs from 'fs'
import path from 'path'

const OUTPUT_DIR = path.join(process.cwd(), 'public/assets/textures/matcaps')

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
}

function createMatcapTexture(width, height, baseR, baseG, baseB) {
  const png = new PNG({ width, height })

  const centerX = width / 2
  const centerY = height / 2
  const maxRadius = Math.sqrt(centerX * centerX + centerY * centerY)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) << 2 // multiply by 4 for RGBA

      // Calculate distance from center for sphere-like effect
      const dx = x - centerX
      const dy = y - centerY
      const distance = Math.sqrt(dx * dx + dy * dy)
      const normalizedDist = Math.min(distance / (maxRadius * 0.7), 1)

      // Base color
      let r = baseR
      let g = baseG
      let b = baseB

      // Add lighting - brighten at center (top-left highlight)
      const highlightDist = Math.sqrt((x - centerX * 0.6) ** 2 + (y - centerY * 0.6) ** 2)
      const highlightFactor = Math.max(0, 1 - highlightDist / (maxRadius * 0.3))
      r = Math.min(255, r + highlightFactor * 100)
      g = Math.min(255, g + highlightFactor * 100)
      b = Math.min(255, b + highlightFactor * 100)

      // Add shadow at edges (bottom-right)
      const shadowFactor = normalizedDist * 0.4
      r = Math.max(0, r - shadowFactor * 60)
      g = Math.max(0, g - shadowFactor * 60)
      b = Math.max(0, b - shadowFactor * 60)

      // Set RGBA values
      png.data[idx] = Math.round(r)
      png.data[idx + 1] = Math.round(g)
      png.data[idx + 2] = Math.round(b)
      png.data[idx + 3] = 255 // Alpha
    }
  }

  return png
}

console.log('Creating matcap textures...\n')

// Create Primary (White)
console.log('Creating primary.png (white)...')
const primaryPng = createMatcapTexture(256, 256, 240, 240, 240)
primaryPng.pack().pipe(fs.createWriteStream(path.join(OUTPUT_DIR, 'primary.png')))

// Create Secondary (Gold)
console.log('Creating secondary.png (gold)...')
const secondaryPng = createMatcapTexture(256, 256, 212, 175, 55)
secondaryPng.pack().pipe(fs.createWriteStream(path.join(OUTPUT_DIR, 'secondary.png')))

// Create Tertiary (Blue)
console.log('Creating tertiary.png (blue)...')
const tertiaryPng = createMatcapTexture(256, 256, 74, 144, 226)
tertiaryPng.pack().pipe(fs.createWriteStream(path.join(OUTPUT_DIR, 'tertiary.png')))

setTimeout(() => {
  console.log('\n✓ Matcap textures created successfully!')
  console.log(`Location: ${OUTPUT_DIR}`)
}, 500)
