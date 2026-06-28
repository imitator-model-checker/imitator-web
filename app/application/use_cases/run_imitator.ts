import { randomUUID } from 'node:crypto'
import type { MultipartFile } from '@adonisjs/bodyparser'
import { outputBroadcaster } from '#infrastructure/realtime/socket_io_broadcaster'
import { WorkspaceStorage } from '#infrastructure/filesystem/workspace_storage'
import { ImitatorProcessRunner } from '#infrastructure/processes/imitator_process_runner'
import { parseOptions, removeForbiddenOptions } from '#domain/options/option_sanitizer'

export class RunImitator {
  constructor(
    private storage = new WorkspaceStorage(),
    private runner = new ImitatorProcessRunner(outputBroadcaster)
  ) {}

  async handle(input: {
    models: MultipartFile[]
    modelBenchmarks: string[]
    property: MultipartFile | null
    propertyBenchmark: string | null
    options: unknown
    version: string | null
  }) {
    if (input.models.length === 0 && input.modelBenchmarks.length === 0) {
      throw new Error('Model field is required')
    }

    const identifier = randomUUID()
    const outputFolder = this.storage.getRunFolder(identifier)

    let propertyPath: string | null = null
    if (input.property || input.propertyBenchmark) {
      if (input.property) {
        const uploadedProperties = await this.storage.moveUploadedFiles(outputFolder, [
          input.property,
        ])
        propertyPath = uploadedProperties[0]
      } else {
        propertyPath = await this.storage.copyBenchmarkProperty(
          outputFolder,
          input.propertyBenchmark!
        )
      }
    }

    const modelsPath =
      input.models.length !== 0
        ? await this.storage.moveUploadedFiles(outputFolder, input.models)
        : await this.storage.copyBenchmarkModels(outputFolder, input.modelBenchmarks)

    const options = removeForbiddenOptions(parseOptions(input.options), ['-output-prefix'])
    const version = input.version || 'latest'
    const outputs = await Promise.all(
      modelsPath.map((model) =>
        this.runner.run({
          model,
          property: propertyPath,
          options,
          outputFolder,
          version,
        })
      )
    )

    return {
      options,
      identifier,
      outputs,
      models: input.models.map((model) => model.clientName),
      property: input.property?.clientName,
    }
  }
}
