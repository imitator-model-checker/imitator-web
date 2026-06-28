import transmit from '@adonisjs/transmit/services/main'
import type { OutputBroadcaster } from '#domain/realtime/output_broadcaster'

type BroadcastPayload =
  string | number | boolean | null | BroadcastPayload[] | { [key: string]: BroadcastPayload }

function toBroadcastPayload(value: unknown): BroadcastPayload {
  if (value === null) return null
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value
  }
  if (Array.isArray(value)) {
    return value.map((item) => toBroadcastPayload(item))
  }
  if (typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, toBroadcastPayload(item)])
    )
  }

  return String(value)
}

class TransmitOutputBroadcaster implements OutputBroadcaster {
  imitatorOutput(model: string, type: 'stdout' | 'error' | 'files', message: unknown) {
    transmit.broadcast('imitator-output', {
      event: 'output',
      model,
      type,
      message: toBroadcastPayload(message),
    })
  }

  imitatorExit() {
    transmit.broadcast('imitator-output', {
      event: 'exit',
    })
  }

  artifactOutput(name: string, type: 'stdout' | 'error' | 'files', message: unknown) {
    transmit.broadcast('artifact-output', {
      event: 'output',
      name,
      type,
      message: toBroadcastPayload(message),
    })
  }

  artifactExit() {
    transmit.broadcast('artifact-output', {
      event: 'exit',
    })
  }
}

export const outputBroadcaster = new TransmitOutputBroadcaster()
