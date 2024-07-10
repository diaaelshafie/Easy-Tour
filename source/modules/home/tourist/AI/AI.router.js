import AItripRouter from './trip/routes.js'
import { Router } from 'express'

const router = Router()

router.use('/trip', AItripRouter)

export default router
