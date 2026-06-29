import path from 'node:path'
import glob from 'fast-glob'
import { runnerConfig } from '#infrastructure/config/runner_config'

export interface BenchmarkFiles {
  models: Record<string, string[]>
  properties: Record<string, string[]>
}

export class BenchmarkRepository {
  async getBenchmarkFiles(): Promise<BenchmarkFiles> {
    const files = await glob('**/*.{imi,imiprop}', {
      onlyFiles: true,
      cwd: runnerConfig.benchmarksFolder,
      followSymbolicLinks: false,
    })

    return files.reduce<BenchmarkFiles>(
      (accumulator, file) => {
        const { dir, ext, name } = path.parse(file)
        const section = ext === '.imi' ? 'models' : 'properties'
        if (dir === '') return accumulator

        accumulator[section][dir] ??= []
        accumulator[section][dir].push(name)

        return accumulator
      },
      { models: {}, properties: {} }
    )
  }

  getBenchmarkModelPath(name: string) {
    return path.join(runnerConfig.benchmarksFolder, `${name}.imi`)
  }

  getBenchmarkPropertyPath(name: string) {
    return path.join(runnerConfig.benchmarksFolder, `${name}.imiprop`)
  }
}
