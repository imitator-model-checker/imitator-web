import { indexEntities } from '@adonisjs/core'
import { defineConfig } from '@adonisjs/core/app'

export default defineConfig({
  experimental: {},

  commands: [() => import('@adonisjs/core/commands')],

  providers: [
    () => import('@adonisjs/core/providers/app_provider'),
    () => import('@adonisjs/core/providers/hash_provider'),
    {
      file: () => import('@adonisjs/core/providers/repl_provider'),
      environment: ['repl', 'test'],
    },
    () => import('@adonisjs/core/providers/edge_provider'),
    () => import('@adonisjs/static/static_provider'),
    () => import('@adonisjs/transmit/transmit_provider'),
  ],

  preloads: [
    () => import('#start/benchmarks'),
    () => import('#start/routes'),
    () => import('#start/kernel'),
    () => import('#start/scheduler'),
  ],

  tests: {
    suites: [],
    forceExit: false,
  },

  metaFiles: [
    {
      pattern: 'resources/views/**/*.edge',
      reloadServer: false,
    },
    {
      pattern: 'public/**',
      reloadServer: false,
    },
  ],

  hooks: {
    init: [indexEntities()],
  },
})
