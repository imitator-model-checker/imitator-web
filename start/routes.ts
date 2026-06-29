import router from '@adonisjs/core/services/router'
import transmit from '@adonisjs/transmit/services/main'

const PagesController = () => import('#controllers/pages_controller')
const ImitatorController = () => import('#controllers/api/imitator_controller')
const ArtifactController = () => import('#controllers/api/artifact_controller')

router.get('/', [PagesController, 'home']).as('home')
router.get('/artifact', [PagesController, 'artifact']).as('artifact')

router
  .group(() => {
    router.get('/', [ImitatorController, 'index'])
    router.post('/run', [ImitatorController, 'run'])
    router
      .get('/download/:identifier/:file', [ImitatorController, 'download'])
      .as('imitator.download')
    router.post('/download', [ImitatorController, 'download']).as('imitator.download.legacy')
    router.post('/stop', [ImitatorController, 'stop'])
  })
  .prefix('/api/imitator')

router
  .group(() => {
    router.get('/', [ArtifactController, 'index'])
    router.post('/run', [ArtifactController, 'run'])
    router.post('/stop', [ArtifactController, 'stop'])
  })
  .prefix('/api/artifact')

transmit.registerRoutes()
