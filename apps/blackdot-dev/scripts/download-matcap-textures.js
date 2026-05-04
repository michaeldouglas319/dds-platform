/**
 * Download matcap textures for loaders from jsDelivr CDN
 * Saves them locally for offline use
 */

import https from 'https'
import fs from 'fs'
import path from 'path'

const OUTPUT_DIR = path.join(process.cwd(), 'public/assets/textures/matcaps')

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
}

const textures = [
  {
    name: 'primary.png',
    url: 'https://cdn.jsdelivr.net/npm/three-stdlib@latest/examples/textures/matcaps/040721_1_4k.png',
  },
  {
    name: 'secondary.png',
    url: 'https://cdn.jsdelivr.net/npm/three-stdlib@latest/examples/textures/matcaps/164_40_40_120.png',
  },
  {
    name: 'tertiary.png',
    url: 'https://cdn.jsdelivr.net/npm/three-stdlib@latest/examples/textures/matcaps/3.png',
  },
]

function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath)
    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Follow redirect
        downloadFile(response.headers.location, filepath).then(resolve).catch(reject)
        return
      }

      response.pipe(file)
      file.on('finish', () => {
        file.close()
        resolve()
      })
      file.on('error', (err) => {
        fs.unlink(filepath, () => {}) // Delete the file on error
        reject(err)
      })
    }).on('error', reject)
  })
}

async function main() {
  console.log(`Downloading matcap textures to ${OUTPUT_DIR}...\n`)

  for (const texture of textures) {
    const filepath = path.join(OUTPUT_DIR, texture.name)
    try {
      console.log(`Downloading ${texture.name}...`)
      await downloadFile(texture.url, filepath)
      console.log(`✓ Downloaded ${texture.name}`)
    } catch (error) {
      console.error(`✗ Failed to download ${texture.name}:`, error.message)
    }
  }

  console.log('\nMatcap textures download complete!')
}

main().catch(console.error)
