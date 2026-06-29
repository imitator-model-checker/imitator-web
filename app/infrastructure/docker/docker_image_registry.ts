import axios from 'axios'
import { runnerConfig } from '#infrastructure/config/runner_config'

export class DockerImageRegistry {
  async getImitatorVersions() {
    const { data } = await axios.get(`${runnerConfig.dockerApi}/tags`)
    return data.results.map((tag: { name: string }) => tag.name)
  }
}
