export interface ArtifactDefinition {
  image: string
  scripts: string[]
  outputArg?: string
}

export type ArtifactCatalog = Record<string, ArtifactDefinition>
