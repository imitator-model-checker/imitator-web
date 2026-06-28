import type { ArtifactCatalog } from '#domain/artifacts/artifact_catalog'

export const artifacts: ArtifactCatalog = {
  tacas21: {
    image: 'imitator:tacas21',
    scripts: ['brp_experiments', 'generate_iterative', 'generate_strategies'],
    outputArg: '-o',
  },
}
