import { Router } from 'express'
import touristAuthRouter from './tourist/routes.js'
import tourGuideAuthRouter from './tourGuide/routes.js'

const router = Router()

router.use('/tourist', touristAuthRouter)
router.use('/tourGuide', tourGuideAuthRouter)

export default router