'use strict'
// Test unzipping a file that was created with a non-node brotli lib,
// piped in as fast as possible.

import t from 'tap'
import { BrotliDecompress } from '../dist/esm/index.js'
import fs from 'node:fs'
import { resolve, basename } from 'path'
import { fileURLToPath } from 'url'

const tmpdir = fileURLToPath(
  new URL(basename(import.meta.url, '.js'), import.meta.url),
)
fs.mkdirSync(tmpdir, {recursive: true})
t.teardown(() => fs.rmSync(tmpdir, {recursive: true, force: true}))

const decompress = new BrotliDecompress()

const fixture = fileURLToPath(
  new URL('fixtures/person.jpg.br', import.meta.url),
)
const unzippedFixture = fileURLToPath(
  new URL('fixtures/person.jpg', import.meta.url),
)
const outputFile = resolve(tmpdir, 'person.jpg')
const expect = fs.readFileSync(unzippedFixture)
const inp = fs.createReadStream(fixture)
const out = fs.createWriteStream(outputFile)

t.test('decompress and test output', t => {
  inp
    .pipe(decompress)
    .pipe(out)
    .on('close', () => {
      const actual = fs.readFileSync(outputFile)
      t.same(actual, expect)
      t.end()
    })
})
