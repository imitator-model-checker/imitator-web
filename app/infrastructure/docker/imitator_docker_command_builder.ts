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

    // Run the container as the host user that owns the bind-mounted workspace
    // so IMITATOR can write its result files (otherwise the image's non-root
    // user hits EACCES on the deployer-owned folder).
    const userOptional =
      typeof process.getuid === 'function' && typeof process.getgid === 'function'
        ? ['--user', `${process.getuid()}:${process.getgid()}`]
        : []

    return {
      command: 'docker',
      arguments: [
        'run',
        '--rm',
        ...userOptional,
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
