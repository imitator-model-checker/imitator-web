import fs from 'node:fs/promises'
import path from 'node:path'
import cron from 'node-cron'
import { subDays } from 'date-fns'
import { runnerConfig } from '#infrastructure/config/runner_config'

async function removeExpiredEntries(directory: string, days: number) {
  try {
    await fs.access(directory)
  } catch {
    return
  }

  const oldestAllowedTime = subDays(new Date(), days)
  const entries = await fs.readdir(directory)

  await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(directory, entry)
      const stats = await fs.stat(fullPath)

      if (stats.ctime <= oldestAllowedTime) {
        await fs.rm(fullPath, { recursive: true, force: true })
      }
    })
  )
}

export function startOutputCleanupScheduler() {
  const cleanup = cron.schedule('0 0 * * *', async () => {
    await removeExpiredEntries(runnerConfig.uploadFolder, runnerConfig.timeLimitFiles)
  })

  cleanup.start()
}
