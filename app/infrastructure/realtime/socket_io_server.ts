import type { Server as HttpServer } from 'node:http'
import { Server as SocketServer } from 'socket.io'
import { outputBroadcaster } from '#infrastructure/realtime/socket_io_broadcaster'

export function configureSocketServer(httpServer: HttpServer) {
  const io = new SocketServer(httpServer)

  io.on('connection', () => {})
  outputBroadcaster.setServer(io)

  return io
}
