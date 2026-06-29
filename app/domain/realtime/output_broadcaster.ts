export interface OutputBroadcaster {
  imitatorOutput(model: string, type: 'stdout' | 'error' | 'files', message: unknown): void
  imitatorExit(): void
  artifactOutput(name: string, type: 'stdout' | 'error' | 'files', message: unknown): void
  artifactExit(): void
}
