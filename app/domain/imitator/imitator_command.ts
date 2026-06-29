export interface ImitatorCommand {
  command: string
  arguments: string[]
}

export interface ImitatorCommandBuilder {
  build(input: {
    model: string
    property: string | null
    options: string[]
    outputFolder: string
    version: string
  }): ImitatorCommand
}
