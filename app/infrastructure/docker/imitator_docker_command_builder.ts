import type { ImitatorCommand, ImitatorCommandBuilder } from '#domain/imitator/imitator_command'

export class ImitatorDockerCommandBuilder implements ImitatorCommandBuilder {
  build(input: {
    model: string
    property: string | null
    options: string[]
    outputFolder: string
    version: string
  }): ImitatorCommand {
    const volume = `${input.outputFolder}:${input.outputFolder}`
    const propertyOptional = input.property ? [input.property] : []

    return {
      command: 'docker',
      arguments: [
        'run',
        '--rm',
        '-v',
        volume,
        `imitator/imitator:${input.version}`,
        ...input.options,
        input.model,
        ...propertyOptional,
      ],
    }
  }
}
