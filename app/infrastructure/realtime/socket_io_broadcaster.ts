import type { Server as SocketServer } from 'socket.io'
import type { OutputBroadcaster } from '#domain/realtime/output_broadcaster'

class SocketIoOutputBroadcaster implements OutputBroadcaster {
  #io: SocketServer | null = null

  setServer(io: SocketServer) {
    this.#io = io
  }

  imitatorOutput(model: string, type: 'stdout' | 'error' | 'files', message: unknown) {
    this.#io?.emit('imitator_output', model, type, message)
  }

  imitatorExit() {
    this.#io?.emit('imitator_exit')
  }

  artifactOutput(name: string, type: 'stdout' | 'error' | 'files', message: unknown) {
    this.#io?.emit('artifact_output', name, type, message)
  }

  artifactExit() {
    this.#io?.emit('artifact_exit')
  }
}

export const outputBroadcaster = new SocketIoOutputBroadcaster()
