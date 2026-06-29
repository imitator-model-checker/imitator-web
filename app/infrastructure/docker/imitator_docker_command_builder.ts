import type { ImitatorCommand, ImitatorCommandBuilder } from '#domain/imitator/imitator_command'

// Tags that point to a moving target: the remote image can change without the
// tag changing, so we must re-pull them on every run. Pinned version tags
// (e.g. v3.4.0) are immutable and can safely use the local cache.
const MUTABLE_TAGS = new Set(['latest', 'develop'])

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

    // Force a fresh pull for moving tags so a newer build on the registry is
    // picked up instead of a stale local image.
    const pullOptional = MUTABLE_TAGS.has(input.version) ? ['--pull', 'always'] : []

    return {
      command: 'docker',
      arguments: [
        'run',
        '--rm',
        ...pullOptional,
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
