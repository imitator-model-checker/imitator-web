import type { HttpContext } from '@adonisjs/core/http'
import { artifacts } from '#infrastructure/config/artifacts'
import { RunArtifact } from '#application/use_cases/run_artifact'
import { StopArtifact } from '#application/use_cases/stop_artifact'

export default class ArtifactController {
  index() {
    return { artifacts: Object.keys(artifacts) }
  }

  async run({ request, response }: HttpContext) {
    try {
      const result = await new RunArtifact().handle({
        artifactName: request.input('artifact') ?? null,
        script: request.input('script') ?? null,
        options: request.input('options') ?? '',
      })

      return { result }
    } catch (error) {
      return response.badRequest({ error: (error as Error).message })
    }
  }

  async stop({ request, response }: HttpContext) {
    try {
      await new StopArtifact().handle(request.input('identifier') ?? null)
      return response.noContent()
    } catch (error) {
      return response.badRequest({ error: (error as Error).message })
    }
  }
}
