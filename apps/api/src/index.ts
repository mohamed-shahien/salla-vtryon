import { createApp } from './app.js'
import { env } from './config/env.js'
import { startJobProcessor } from './jobs/processor.js'

const app = createApp()
const jobProcessor = startJobProcessor()

const server = app.listen(env.PORT, () => {
  console.log(`[api] listening on http://localhost:${env.PORT}`)
})

function shutdown(signal: string) {
  console.log(`[api] received ${signal}, stopping job processor and HTTP server`)
  jobProcessor.stop()
  server.close(() => {
    process.exit(0)
  })
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))
