import { Client } from '@upstash/qstash'
import { expiredUploadCleanupSchedule } from './expired-upload-cleanup-schedule.config.mjs'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
const token = process.env.QSTASH_TOKEN

if (!baseUrl) {
  throw new Error('Missing NEXT_PUBLIC_BASE_URL')
}

if (!token) {
  throw new Error('Missing QSTASH_TOKEN')
}

const destination = new URL(expiredUploadCleanupSchedule.path, baseUrl).toString()
const client = new Client({
  token,
  baseUrl: process.env.QSTASH_URL,
})

const { scheduleId } = await client.schedules.create({
  destination,
  scheduleId: expiredUploadCleanupSchedule.id,
  cron: expiredUploadCleanupSchedule.cron,
  method: 'POST',
  body: '',
  retries: expiredUploadCleanupSchedule.retries,
  timeout: expiredUploadCleanupSchedule.timeout,
  label: 'expired-upload-cleanup',
})

console.log(`QStash cleanup schedule ${scheduleId} is active.`)
console.log(`Cron: ${expiredUploadCleanupSchedule.cron}`)
console.log(`Destination: ${destination}`)
