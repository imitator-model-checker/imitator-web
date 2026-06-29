export interface ProcessRun {
  pid?: number
}

export interface ImitatorProcessRun extends ProcessRun {
  outputFolder: string
  prefix: string
}

export interface ArtifactProcessRun extends ProcessRun {
  container: string
}
