import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env') })

const connectionString = process.env.DATABASE_URL || ''
const isLocal = connectionString.includes('localhost') || connectionString.includes('127.0.0.1')
const pool = new Pool({
  connectionString,
  ssl: isLocal ? undefined : { rejectUnauthorized: false },
})
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

const defaultProviders = [
  {
    name: 'veo',
    displayName: 'Google Veo 3',
    apiEndpoint: 'https://us-central1-aiplatform.googleapis.com',
    model: 'veo-3',
    maxDuration: 30,
    maxResolution: '4k',
    creditCost: 2,
    speed: 60,
    quality: 85,
    isActive: true,
  },
  {
    name: 'kling',
    displayName: 'Kling AI',
    apiEndpoint: 'https://api.klingai.com',
    model: 'kling-v1-5',
    maxDuration: 10,
    maxResolution: '1080p',
    creditCost: 1,
    speed: 75,
    quality: 70,
    isActive: true,
  },
  {
    name: 'sora',
    displayName: 'OpenAI Sora',
    apiEndpoint: 'https://api.openai.com/v1',
    model: 'sora-v1',
    maxDuration: 60,
    maxResolution: '1080p',
    creditCost: 3,
    speed: 40,
    quality: 90,
    isActive: true,
  },
  {
    name: 'runway',
    displayName: 'Runway Gen-3',
    apiEndpoint: 'https://api.runwayml.com/v1',
    model: 'gen-3',
    maxDuration: 20,
    maxResolution: '1080p',
    creditCost: 1,
    speed: 70,
    quality: 75,
    isActive: true,
  },
  {
    name: 'pika',
    displayName: 'Pika Art',
    apiEndpoint: 'https://api.pika.art/v1',
    model: 'pika-v2',
    maxDuration: 10,
    maxResolution: '1080p',
    creditCost: 1,
    speed: 65,
    quality: 65,
    isActive: false,
  },
  {
    name: 'luma',
    displayName: 'Luma Dream Machine',
    apiEndpoint: 'https://api.lumalabs.ai/v1',
    model: 'dream-machine-v1',
    maxDuration: 10,
    maxResolution: '1080p',
    creditCost: 1,
    speed: 55,
    quality: 80,
    isActive: false,
  },
  {
    name: 'pixverse',
    displayName: 'PixVerse',
    apiEndpoint: 'https://api.pixverse.ai/v1',
    model: 'pixverse-v3',
    maxDuration: 10,
    maxResolution: '1080p',
    creditCost: 1,
    speed: 80,
    quality: 60,
    isActive: false,
  },
  {
    name: 'hailuo',
    displayName: 'Hailuo AI',
    apiEndpoint: 'https://api.hailuo.ai/v1',
    model: 'hailuo-v1',
    maxDuration: 10,
    maxResolution: '1080p',
    creditCost: 1,
    speed: 60,
    quality: 70,
    isActive: false,
  },
  {
    name: 'wan',
    displayName: 'Wan Video',
    apiEndpoint: 'https://api.wan.video/v1',
    model: 'wan-v2',
    maxDuration: 10,
    maxResolution: '1080p',
    creditCost: 1,
    speed: 50,
    quality: 50,
    isActive: false,
  },
  {
    name: 'elevenlabs',
    displayName: 'ElevenLabs',
    apiEndpoint: 'https://api.elevenlabs.io/v1',
    model: 'eleven-multilingual-v2',
    maxDuration: 0,
    maxResolution: '',
    creditCost: 0.5,
    speed: 90,
    quality: 85,
    isActive: true,
  },
]

async function main() {
  console.log('Seeding AI providers...')

  for (const provider of defaultProviders) {
    await prisma.aIProvider.upsert({
      where: { name: provider.name },
      update: provider,
      create: provider,
    })
    console.log(`  ✓ ${provider.displayName} (${provider.name})`)
  }

  console.log('Seed completed successfully.')
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
