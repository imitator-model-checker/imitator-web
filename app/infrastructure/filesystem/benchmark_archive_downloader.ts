import crypto from 'node:crypto'
import { createReadStream, createWriteStream } from 'node:fs'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { pipeline } from 'node:stream/promises'
import axios from 'axios'
import glob from 'fast-glob'
import { openPromise, validateFileName } from 'yauzl'
import { runnerConfig } from '#infrastructure/config/runner_config'

export type BenchmarkArchiveResult = 'disabled' | 'ready' | 'downloaded'

export class BenchmarkArchiveDownloader {
  async ensureAvailable(): Promise<BenchmarkArchiveResult> {
    if (!runnerConfig.benchmarksAutoDownload) return 'disabled'

    const destination = path.resolve(runnerConfig.benchmarksFolder)
    if (await this.hasBenchmarkFiles(destination)) return 'ready'

    await fs.mkdir(destination, { recursive: true })

    const workFolder = await fs.mkdtemp(path.join(os.tmpdir(), 'imitator-benchmarks-'))
    const archivePath = path.join(workFolder, 'benchmarks.zip')
    const extractFolder = path.join(workFolder, 'extract')

    try {
      await fs.mkdir(extractFolder, { recursive: true })
      await this.downloadArchive(archivePath)
      await this.verifyArchive(archivePath)

      await this.extractArchive(archivePath, extractFolder)

      const sourceFolder = await this.findBenchmarkRoot(extractFolder)
      await fs.cp(sourceFolder, destination, { recursive: true })

      if (!(await this.hasBenchmarkFiles(destination))) {
        throw new Error('downloaded archive does not contain Imitator benchmark files')
      }

      return 'downloaded'
    } finally {
      await fs.rm(workFolder, { recursive: true, force: true })
    }
  }

  private async hasBenchmarkFiles(folder: string) {
    try {
      await fs.access(folder)
    } catch {
      return false
    }

    const files = await glob('**/*.{imi,imiprop}', {
      cwd: folder,
      onlyFiles: true,
      followSymbolicLinks: false,
    })

    return files.length > 0
  }

  private async downloadArchive(destination: string) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), runnerConfig.benchmarksDownloadTimeoutMs)

    try {
      const response = await axios.get(runnerConfig.benchmarksArchiveUrl, {
        responseType: 'stream',
        signal: controller.signal,
      })

      await pipeline(response.data, createWriteStream(destination), { signal: controller.signal })
    } catch (error) {
      if (controller.signal.aborted) {
        throw new Error(
          `benchmark archive download timed out after ${runnerConfig.benchmarksDownloadTimeoutMs}ms`
        )
      }

      throw error
    } finally {
      clearTimeout(timeout)
    }
  }

  private async verifyArchive(archivePath: string) {
    const checksum = runnerConfig.benchmarksArchiveChecksum
    if (!checksum) return

    const [algorithm, expected] = checksum.split(':')
    if (!algorithm || !expected) return

    const actual = await this.hashFile(archivePath, algorithm)
    if (actual !== expected) {
      throw new Error(`benchmark archive checksum mismatch: expected ${expected}, got ${actual}`)
    }
  }

  private async extractArchive(archivePath: string, destination: string) {
    const zipFile = await openPromise(archivePath, {
      lazyEntries: true,
      strictFileNames: true,
      validateEntrySizes: true,
    })

    try {
      for await (const entry of zipFile.eachEntry()) {
        const validationError = validateFileName(entry.fileName)
        if (validationError) {
          throw new Error(`invalid benchmark archive entry "${entry.fileName}": ${validationError}`)
        }

        const destinationPath = path.resolve(destination, entry.fileName)
        if (
          destinationPath !== destination &&
          !destinationPath.startsWith(`${destination}${path.sep}`)
        ) {
          throw new Error(
            `refusing to extract archive entry outside destination: ${entry.fileName}`
          )
        }

        if (entry.fileName.endsWith('/')) {
          await fs.mkdir(destinationPath, { recursive: true })
          continue
        }

        await fs.mkdir(path.dirname(destinationPath), { recursive: true })

        const stream = await zipFile.openReadStreamPromise(entry)
        await pipeline(stream, createWriteStream(destinationPath))
      }
    } finally {
      zipFile.close()
    }
  }

  private async hashFile(filePath: string, algorithm: string) {
    const hash = crypto.createHash(algorithm)

    for await (const chunk of createReadStream(filePath)) {
      hash.update(chunk)
    }

    return hash.digest('hex')
  }

  private async findBenchmarkRoot(extractFolder: string) {
    const archiveRoot = path.join(extractFolder, 'benchmarks')
    if (await this.hasBenchmarkFiles(archiveRoot)) return archiveRoot

    if (await this.hasBenchmarkFiles(extractFolder)) return extractFolder

    throw new Error('benchmark archive does not contain .imi or .imiprop files')
  }
}
