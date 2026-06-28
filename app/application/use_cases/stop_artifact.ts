import { outputBroadcaster } from '#infrastructure/realtime/transmit_broadcaster'
import { ArtifactProcessRunner } from '#infrastructure/processes/artifact_process_runner'

export class StopArtifact {
  constructor(private runner = new ArtifactProcessRunner(outputBroadcaster)) {}

  async handle(identifier: string | null) {
    if (!identifier) {
      throw new Error('identifier is required')
    }

    await this.runner.stop(identifier)
  }
}
