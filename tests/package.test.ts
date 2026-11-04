import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))

describe('the published package', () => {
  it('declares types from the built declarations, not from source', () => {
    expect(pkg.types).toBe('./dist/index.d.ts')
    expect(pkg.exports['.'].import.types).toBe('./dist/index.d.ts')
    expect(pkg.exports['.'].require.types).toBe('./dist/index.d.cts')
  })

  it('ships only the build', () => {
    expect(pkg.files).toEqual(['dist'])
  })

  it('has every file the exports name, once built', () => {
    for (const file of ['dist/index.d.ts', 'dist/index.d.cts', 'dist/index.js', 'dist/index.cjs']) {
      expect(existsSync(new URL(`../${file}`, import.meta.url)), file).toBe(true)
    }
  })
})
