import router from '@adonisjs/core/services/router'
import server from '@adonisjs/core/services/server'

server.errorHandler(() => import('#exceptions/handler'))

server.use([() => import('@adonisjs/static/static_middleware')])

router.use([() => import('@adonisjs/core/bodyparser_middleware')])
