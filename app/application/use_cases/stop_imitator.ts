import { outputBroadcaster } from '#infrastructure/realtime/transmit_broadcaster'
import { ImitatorProcessRunner } from '#infrastructure/processes/imitator_process_runner'

export class StopImitator {
  constructor(private runner = new ImitatorProcessRunner(outputBroadcaster)) {}

  async handle(identifiers: unknown) {
    if (!Array.isArray(identifiers) || identifiers.length === 0) {
      throw new Error('An identifier is required')
    }

    await Promise.all(identifiers.map((identifier) => this.runner.stop(identifier)))
  }
}
