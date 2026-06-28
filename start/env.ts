import { Env } from '@adonisjs/core/env'

export default await Env.create(new URL('../', import.meta.url), {
  NODE_ENV: Env.schema.enum.optional(['development', 'production', 'test'] as const),
  PORT: Env.schema.number.optional(),
  HOST: Env.schema.string.optional({ format: 'host' }),
  LOG_LEVEL: Env.schema.string.optional(),

  APP_KEY: Env.schema.secret.optional(),
  APP_NAME: Env.schema.string.optional(),
  APP_URL: Env.schema.string.optional({ format: 'url', tld: false }),

  UPLOAD_FOLDER: Env.schema.string.optional(),
  BENCHMARKS_FOLDER: Env.schema.string.optional(),
  DOCKER_API: Env.schema.string.optional({ format: 'url' }),
  TIME_LIMIT_FILES: Env.schema.number.optional(),
})
