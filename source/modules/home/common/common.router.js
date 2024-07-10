import { Router } from './routes.imports.js'
import notificationsRouter from './notifications/routes.js'

const router = Router()

router.use('/notifications', notificationsRouter)

export default router