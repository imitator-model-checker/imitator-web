import fs from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { spawn } from 'node:child_process'
import { Transform } from 'node:stream'
import glob from 'fast-glob'
import stripAnsi from 'strip-ansi'
import type { OutputBroadcaster } from '#domain/realtime/output_broadcaster'
import type { ArtifactProcessRun } from '#domain/runs/run_result'

function createStripAnsiStream() {
  return new Transform({
    transform(chunk, _encoding, done) {
      done(null, stripAnsi(chunk.toString()))
    },
  })
}

export class ArtifactProcessRunner {
  constructor(private broadcaster: OutputBroadcaster) {}

  run(input: {
    name: string
    image: string
    script: string
    options: string[]
    outputFolder: string
  }): Promise<ArtifactProcessRun> {
    return new Promise((resolve, reject) => {
      const containerName = `${input.name}-${randomUUID()}`
      // Run as the host user owning the bind-mounted workspace so the container
      // can write its outputs to the deployer-owned folder without EACCES.
      const userOptional =
        typeof process.getuid === 'function' && typeof process.getgid === 'function'
          ? ['--user', `${process.getuid()}:${process.getgid()}`]
          : []
      const artifact = spawn('docker', [
        'run',
        '--rm',
        ...userOptional,
        '--name',
        containerName,
        '-v',
        `${input.outputFolder}:${input.outputFolder}`,
        input.image,
        input.script,
        ...input.options,
      ])

      artifact.stdout.setEncoding('utf-8')
      artifact.stdout.on('data', (stdout) => {
        this.broadcaster.artifactOutput(input.name, 'stdout', stripAnsi(stdout.toString()))
      })

      artifact.stderr.setEncoding('utf-8')
      artifact.stderr.on('data', (stderr) => {
        this.broadcaster.artifactOutput(input.name, 'error', stripAnsi(stderr.toString()))
      })

      const logFile = path.join(input.outputFolder, `${input.script}.log`)
      artifact.stdout.pipe(createStripAnsiStream()).pipe(fs.createWriteStream(logFile))

      artifact.on('error', (error) => reject(error))
      artifact.on('exit', async (code) => {
        if (code !== 0) {
          reject(new Error('Artifact error'))
          return
        }

        const files = await glob(path.join(input.outputFolder, '*'))
        this.broadcaster.artifactOutput(input.name, 'files', {
          path: path.basename(input.outputFolder),
          files: files.map((file) => path.basename(file)),
        })
        this.broadcaster.artifactExit()
      })

      resolve({
        pid: artifact.pid,
        container: containerName,
      })
    })
  }

  async stop(containerName: string) {
    await new Promise<void>((resolve, reject) => {
      const command = spawn('docker', ['stop', containerName])

      command.on('error', (error) => reject(error))
      command.on('exit', () => resolve())
    })
  }
}
