import env from '#start/env'
import { defineConfig, drivers } from '@adonisjs/core/encryption'

const encryptionConfig = defineConfig({
  default: 'gcm',
  list: {
    gcm: drivers.aes256gcm({
      keys: [env.get('APP_KEY', 'oat8ljg13u3ta6v436q540dk7djcz9h3')],
      id: 'gcm',
    }),
  },
})

export default encryptionConfig
