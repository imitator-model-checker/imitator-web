import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { artifacts } from '#infrastructure/config/artifacts'
import { runnerConfig } from '#infrastructure/config/runner_config'
import { WorkspaceStorage } from '#infrastructure/filesystem/workspace_storage'
import { outputBroadcaster } from '#infrastructure/realtime/transmit_broadcaster'
import { ArtifactProcessRunner } from '#infrastructure/processes/artifact_process_runner'
import { parseOptions } from '#domain/options/option_sanitizer'

export class RunArtifact {
  constructor(
    private storage = new WorkspaceStorage(),
    private runner = new ArtifactProcessRunner(outputBroadcaster)
  ) {}

  async handle(input: { artifactName: string | null; script: string | null; options: unknown }) {
    const artifactNames = Object.keys(artifacts)

    if (!input.artifactName || !artifactNames.includes(input.artifactName)) {
      throw new Error('Valid artifact name is required')
    }

    const artifact = artifacts[input.artifactName]
    if (!input.script || !artifact.scripts.includes(input.script)) {
      throw new Error('Valid script is required')
    }

    const identifier = randomUUID()
    const outputFolder = path.join(runnerConfig.uploadFolder, identifier)
    await this.storage.createFolder(outputFolder)

    let options = parseOptions(input.options)
    if (artifact.outputArg) {
      const outputFile = path.join(outputFolder, `${input.script}-output.txt`)
      options = options.concat([artifact.outputArg, outputFile])
    }

    const output = await this.runner.run({
      name: input.artifactName,
      image: artifact.image,
      script: input.script,
      options,
      outputFolder,
    })

    return {
      name: input.artifactName,
      identifier: output.container,
      script: input.script,
      options,
    }
  }
}
