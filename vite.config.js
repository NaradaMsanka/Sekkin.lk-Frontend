import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import fs from 'node:fs'
import process from 'node:process'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { readReleaseConfiguration } from './scripts/release-mode.mjs'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const release = readReleaseConfiguration()
  const selected = mode === 'merchant' ? 'COD_STORE' : release.mode
  const app = selected === 'PUBLIC_CATALOG' ? './src/catalog/CatalogApp.jsx' : './src/App.jsx'
  const revision = process.env.VERCEL_GIT_COMMIT_SHA || execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
  const proofPath = new URL('./docs/release-verification/catalog-backend-containment.json', import.meta.url)
  const proof = fs.existsSync(proofPath) ? JSON.parse(fs.readFileSync(proofPath, 'utf8')) : null
  return {
    resolve: { alias: { '#release-app': fileURLToPath(new URL(app, import.meta.url)) } },
    plugins: [react(), {
      name: 'sekkin-release-identity',
      generateBundle() {
        this.emitFile({ type: 'asset', fileName: 'release.json', source: JSON.stringify({ schemaVersion: 1, mode: selected, checkout: selected === 'PUBLIC_CATALOG' ? 'DISABLED' : 'COD_ONLY', accounts: selected === 'PUBLIC_CATALOG' ? 'DISABLED' : 'ENABLED', frontendCommit: revision, backendCommit: proof?.backendRevision || null, builtAtUtc: new Date().toISOString() }, null, 2) })
      },
    }],
  }
})
