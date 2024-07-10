import { Router } from 'express'

import touristHomeRouter from './tourist/touristHome.router.js'
import tourGuideHomeRouter from './tourGuide/tourGuideHome.router.js'
import commonRouter from './common/common.router.js'

const router = Router()

router.use('/tourist', touristHomeRouter)
router.use('/tourGuide', tourGuideHomeRouter)
router.use('/common', commonRouter)

export default router