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

    const benchmarks = files
      .sort((left, right) => left.localeCompare(right))
      .reduce<BenchmarkFiles>(
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

    return {
      models: this.sortBenchmarkGroups(benchmarks.models),
      properties: this.sortBenchmarkGroups(benchmarks.properties),
    }
  }

  getBenchmarkModelPath(name: string) {
    return path.join(runnerConfig.benchmarksFolder, `${name}.imi`)
  }

  getBenchmarkPropertyPath(name: string) {
    return path.join(runnerConfig.benchmarksFolder, `${name}.imiprop`)
  }

  private sortBenchmarkGroups(groups: Record<string, string[]>) {
    return Object.fromEntries(
      Object.entries(groups)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([group, files]) => [group, files.sort((left, right) => left.localeCompare(right))])
    )
  }
}
