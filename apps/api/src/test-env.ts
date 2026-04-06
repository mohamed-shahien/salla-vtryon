import { env } from './config/env.js'

console.log('--- Environment Verification ---')
console.log(`REPLICATE_API_TOKEN exists: ${!!env.REPLICATE_API_TOKEN}`)
if (env.REPLICATE_API_TOKEN) {
  console.log(`REPLICATE_API_TOKEN length: ${env.REPLICATE_API_TOKEN.trim().length}`)
  console.log(`REPLICATE_API_TOKEN prefix: ${env.REPLICATE_API_TOKEN.trim().slice(0, 4)}`)
} else {
  console.log('REPLICATE_API_TOKEN is MISSING in process.env')
}
console.log('--- End of Verification ---')
