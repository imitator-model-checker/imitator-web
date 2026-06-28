import { WorkspaceStorage } from '#infrastructure/filesystem/workspace_storage'

export class DownloadOutputFile {
  constructor(private storage = new WorkspaceStorage()) {}

  async handle(input: { identifier: string | null; file: string | null }) {
    if (!input.file) throw new Error('filename is required')
    if (!input.identifier) throw new Error('identifier is required')

    return this.storage.assertDownloadableFile(input.identifier, input.file)
  }
}
