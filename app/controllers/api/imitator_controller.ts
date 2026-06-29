import type { HttpContext } from '@adonisjs/core/http'
import { RunImitator } from '#application/use_cases/run_imitator'
import { StopImitator } from '#application/use_cases/stop_imitator'
import { DownloadOutputFile } from '#application/use_cases/download_output_file'

function toArray(value: unknown) {
  if (Array.isArray(value)) return value.filter(Boolean).map(String)
  if (value) return [String(value)]
  return []
}

export default class ImitatorController {
  index() {
    return { message: 'Imitator API' }
  }

  async run({ request, response }: HttpContext) {
    try {
      const result = await new RunImitator().handle({
        models: request.files('models', { extnames: ['imi'] }),
        modelBenchmarks: toArray(request.input('models_benchmark')),
        property: request.file('property', { extnames: ['imiprop'] }),
        propertyBenchmark: request.input('properties_benchmark') ?? null,
        options: request.input('options') ?? '',
        version: request.input('version') ?? 'latest',
      })

      return { result }
    } catch (error) {
      return response.badRequest({ error: (error as Error).message })
    }
  }

  async download({ params, response }: HttpContext) {
    try {
      const filePath = await new DownloadOutputFile().handle({
        file: params.file ?? null,
        identifier: params.identifier ?? null,
      })

      return response.download(filePath)
    } catch (error) {
      return response.badRequest({ error: (error as Error).message })
    }
  }

  async stop({ request, response }: HttpContext) {
    try {
      await new StopImitator().handle(request.input('identifiers'))
      return response.noContent()
    } catch (error) {
      return response.badRequest({ error: (error as Error).message })
    }
  }
}
