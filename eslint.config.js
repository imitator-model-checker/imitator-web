import { configApp } from '@adonisjs/eslint-config'

export default configApp({
  ignores: ['build/**', 'node_modules/**', 'public/vendor/**', 'old/**'],
})
