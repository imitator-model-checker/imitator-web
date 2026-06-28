await import('reflect-metadata')
const { createServer } = await import('node:http')
const { Ignitor, prettyPrintError } = await import('@adonisjs/core')
const { configureSocketServer } = await import('#infrastructure/realtime/socket_io_server')

const APP_ROOT = new URL('../', import.meta.url)

const IMPORTER = (filePath: string) => {
  if (filePath.startsWith('./') || filePath.startsWith('../')) {
    return import(new URL(filePath, APP_ROOT).href)
  }

  return import(filePath)
}

new Ignitor(APP_ROOT, { importer: IMPORTER })
  .tap((app) => {
    app.booting(async () => {
      await import('#start/env')
    })
    app.listen('SIGTERM', () => app.terminate())
    app.listenIf(app.managedByPm2, 'SIGINT', () => app.terminate())
  })
  .httpServer()
  .start((handler) => {
    const httpServer = createServer(handler)
    configureSocketServer(httpServer)
    return httpServer
  })
  .catch((error) => {
    process.exitCode = 1
    prettyPrintError(error)
  })
