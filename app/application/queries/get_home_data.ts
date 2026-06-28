import { BenchmarkRepository } from '#infrastructure/filesystem/benchmark_repository'
import { DockerImageRegistry } from '#infrastructure/docker/docker_image_registry'

export class GetHomeData {
  constructor(
    private benchmarks = new BenchmarkRepository(),
    private dockerImages = new DockerImageRegistry()
  ) {}

  async handle() {
    const [benchmarks, versions] = await Promise.all([
      this.benchmarks.getBenchmarkFiles(),
      this.dockerImages.getImitatorVersions().catch(() => ['latest']),
    ])

    return { benchmarks, versions }
  }
}
