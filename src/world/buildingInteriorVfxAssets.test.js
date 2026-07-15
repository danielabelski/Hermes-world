import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { describe, it } from 'node:test'

const EFFECTS = [
  'archive-interior-codex-armillary',
  'archive-interior-shelf-ingestion',
  'citadel-interior-command-table',
  'citadel-interior-core-charge',
  'forge-interior-fire',
  'forge-interior-impact-sparks',
  'forge-interior-smoke',
  'sanctum-interior-energy-column',
  'sanctum-interior-pool-circulation',
  'watcher-interior-armillary-calibration',
  'watcher-interior-lens-scan',
]

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

function readPngContract(url) {
  const bytes = readFileSync(url)
  assert.deepEqual(bytes.subarray(0, 8), PNG_SIGNATURE)
  return {
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
    colorType: bytes[25],
    bytes: bytes.length,
  }
}

describe('cinematic interior VFX assets', () => {
  it('ships exactly eleven lightweight RGBA runtime strips with canonical sources', () => {
    const runtimeDirectory = new URL('../assets/building-interior-effects/', import.meta.url)
    const runtimeFiles = readdirSync(runtimeDirectory).filter((name) => name.endsWith('.runtime.png')).sort()
    const expectedRuntimeFiles = EFFECTS.map((name) => `${name}-strip.runtime.png`).sort()
    assert.deepEqual(runtimeFiles, expectedRuntimeFiles)

    let runtimeBudget = 0
    for (const effect of EFFECTS) {
      const runtime = new URL(`../assets/building-interior-effects/${effect}-strip.runtime.png`, import.meta.url)
      const source = new URL(`../../artifacts/interior-vfx/${effect}-strip.png`, import.meta.url)
      assert.equal(existsSync(source), true, `missing canonical source for ${effect}`)

      const runtimeContract = readPngContract(runtime)
      const sourceContract = readPngContract(source)
      assert.deepEqual(runtimeContract, { ...runtimeContract, width: 1024, height: 128, colorType: 6 })
      assert.deepEqual(sourceContract, { ...sourceContract, width: 2048, height: 256, colorType: 6 })
      assert.ok(runtimeContract.bytes <= 250_000, `${effect} exceeds the 250 KB runtime budget`)
      assert.ok(statSync(source).size > runtimeContract.bytes, `${effect} runtime should be smaller than its canonical source`)
      runtimeBudget += runtimeContract.bytes
    }
    assert.ok(runtimeBudget <= 1_800_000, `interior VFX package exceeds budget: ${runtimeBudget} bytes`)
  })
})
