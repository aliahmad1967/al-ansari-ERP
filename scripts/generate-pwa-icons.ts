/**
 * PWA icon generation script.
 *
 * Icons are now SVG-based (see public/assets/icon-192.svg and icon-512.svg).
 * For production, replace these SVG placeholders with actual designed PNG icons.
 *
 * To generate proper PNGs from SVG, use:
 *   npx sharp-cli -i public/assets/icon-512.svg -o public/assets/icon-512.png resize 512 512
 *   npx sharp-cli -i public/assets/icon-512.svg -o public/assets/icon-192.png resize 192 192
 */

import fs from 'node:fs'
import path from 'node:path'

const ASSETS_DIR = path.resolve(import.meta.dirname ?? '.', '../public/assets')

function main(): void {
  console.log('PWA Icons Status:')
  console.log('=================')

  const files = ['logo.svg', 'icon-192.svg', 'icon-512.svg']
  for (const file of files) {
    const filePath = path.join(ASSETS_DIR, file)
    const exists = fs.existsSync(filePath)
    console.log(`  ${exists ? '✓' : '✗'} ${file}`)
  }

  console.log('\nNote: Current icons are SVG placeholders.')
  console.log('For production, generate proper PNGs with a tool like sharp or imagemagick.')
}

main()
