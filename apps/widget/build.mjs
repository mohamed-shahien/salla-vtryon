import { readFileSync, rmSync } from 'node:fs'

import { build, context } from 'esbuild'

const watch = process.argv.includes('--watch')
const widgetCss = readFileSync(new URL('./src/styles.css', import.meta.url), 'utf8')

const config = {
  entryPoints: ['src/widget.ts'],
  bundle: true,
  format: 'iife',
  globalName: 'VirtualTryOnWidget',
  outfile: 'dist/widget.js',
  target: 'es2022',
  sourcemap: true,
  logLevel: 'info',
  define: {
    __WIDGET_CSS__: JSON.stringify(widgetCss),
  },
}

if (watch) {
  const ctx = await context(config)
  await ctx.watch()
  console.log('[widget] watching for changes...')
} else {
  rmSync('dist', { recursive: true, force: true })
  await build(config)
}
