import { build, context } from 'esbuild'

const watch = process.argv.includes('--watch')

const config = {
  entryPoints: ['src/widget.ts'],
  bundle: true,
  format: 'iife',
  globalName: 'VirtualTryOnWidget',
  outfile: 'dist/widget.js',
  target: 'es2022',
  sourcemap: true,
  logLevel: 'info',
}

if (watch) {
  const ctx = await context(config)
  await ctx.watch()
  console.log('[widget] watching for changes...')
} else {
  await build(config)
}
