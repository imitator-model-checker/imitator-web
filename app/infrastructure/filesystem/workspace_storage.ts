import fs from 'node:fs/promises'
import path from 'node:path'
import type { MultipartFile } from '@adonisjs/bodyparser'
import { runnerConfig } from '#infrastructure/config/runner_config'
import { BenchmarkRepository } from '#infrastructure/filesystem/benchmark_repository'

export class WorkspaceStorage {
  #benchmarks = new BenchmarkRepository()

  getRunFolder(identifier: string) {
    return path.join(runnerConfig.uploadFolder, identifier)
  }

  async createFolder(destination: string) {
    await fs.mkdir(destination, { recursive: true })
  }

  async moveUploadedFiles(destination: string, files: MultipartFile[]) {
    await this.createFolder(destination)

    await Promise.all(
      files.map((file) =>
        file.move(destination, {
          name: file.clientName,
          overwrite: true,
        })
      )
    )

    return files.map((file) => path.join(destination, file.clientName))
  }

  async copyBenchmarkModels(destination: string, benchmarks: string[]) {
    await this.createFolder(destination)
    const files = benchmarks.map((benchmark) => this.#benchmarks.getBenchmarkModelPath(benchmark))

    await Promise.all(
      files.map((file) => fs.copyFile(file, path.join(destination, path.basename(file))))
    )

    return files.map((file) => path.join(destination, path.basename(file)))
  }

  async copyBenchmarkProperty(destination: string, benchmark: string) {
    await this.createFolder(destination)

    const file = this.#benchmarks.getBenchmarkPropertyPath(benchmark)
    const output = path.join(destination, path.basename(file))
    await fs.copyFile(file, output)

    return output
  }

  async assertDownloadableFile(identifier: string, file: string) {
    if (path.basename(identifier) !== identifier) {
      throw new Error('invalid identifier')
    }

    if (path.basename(file) !== file) {
      throw new Error('invalid filename')
    }

    const fullPath = path.join(runnerConfig.uploadFolder, identifier, file)
    await fs.access(fullPath)
    return fullPath
  }
}
