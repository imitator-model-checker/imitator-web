import { defineConfig } from '@adonisjs/core/bodyparser'

const bodyParserConfig = defineConfig({
  allowedMethods: ['POST', 'PUT', 'PATCH', 'DELETE'],
  form: {
    convertEmptyStringsToNull: true,
    trimWhitespaces: true,
    types: ['application/x-www-form-urlencoded'],
  },
  json: {
    convertEmptyStringsToNull: true,
    trimWhitespaces: true,
    types: [
      'application/json',
      'application/json-patch+json',
      'application/vnd.api+json',
      'application/csp-report',
    ],
  },
  multipart: {
    autoProcess: true,
    convertEmptyStringsToNull: true,
    trimWhitespaces: true,
    processManually: [],
    limit: '50mb',
    types: ['multipart/form-data'],
  },
})

export default bodyParserConfig
