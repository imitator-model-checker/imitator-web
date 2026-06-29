import path from 'node:path'
import { spawn } from 'node:child_process'
import glob from 'fast-glob'
import stripAnsi from 'strip-ansi'
import type { OutputBroadcaster } from '#domain/realtime/output_broadcaster'
import type { ImitatorProcessRun } from '#domain/runs/run_result'
import type { ImitatorCommandBuilder } from '#domain/imitator/imitator_command'
import { ImitatorDockerCommandBuilder } from '#infrastructure/docker/imitator_docker_command_builder'

export class ImitatorProcessRunner {
  constructor(
    private broadcaster: OutputBroadcaster,
    private commandBuilder: ImitatorCommandBuilder = new ImitatorDockerCommandBuilder()
  ) {}

  run(input: {
    model: string
    property: string | null
    options: string[]
    outputFolder: string
    version: string
  }): Promise<ImitatorProcessRun> {
    return new Promise((resolve, reject) => {
      const result = { output: '', error: '' }
      const modelName = path.basename(input.model, path.extname(input.model))
      const outputPrefix = path.join(input.outputFolder, modelName)
      const options = ['-output-prefix', outputPrefix, ...input.options]
      const command = this.commandBuilder.build({ ...input, options })
      const imitator = spawn(command.command, command.arguments)

      imitator.stdout.setEncoding('utf-8')
      imitator.stdout.on('data', (stdout) => {
        result.output += stripAnsi(stdout.toString())
        this.broadcaster.imitatorOutput(modelName, 'stdout', result.output)
      })

      imitator.stderr.setEncoding('utf-8')
      imitator.stderr.on('data', (stderr) => {
        result.error += stripAnsi(stderr.toString())
        this.broadcaster.imitatorOutput(modelName, 'error', result.error)
      })

      imitator.on('exit', async (code) => {
        if (code !== 0) {
          this.broadcaster.imitatorOutput(modelName, 'error', result.error)
          reject(new Error(result.error || `Imitator exited with code ${code}`))
          return
        }

        const files = await glob(`${outputPrefix}*.!(zip)`)
        if (input.property) {
          files.push(input.property)
        }

        this.broadcaster.imitatorOutput(modelName, 'files', {
          path: path.basename(input.outputFolder),
          files: files.map((file) => path.basename(file)),
        })
        this.broadcaster.imitatorExit()
      })

      imitator.on('error', (error) => reject(error))

      resolve({
        outputFolder: input.outputFolder,
        pid: imitator.pid,
        prefix: modelName,
      })
    })
  }

  async stop(pid: string | number) {
    const normalizedPid = Number(pid)
    if (!Number.isInteger(normalizedPid) || normalizedPid <= 0) {
      throw new Error('A valid process id is required')
    }

    try {
      process.kill(normalizedPid)
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ESRCH') {
        throw error
      }
    }
  }
}
