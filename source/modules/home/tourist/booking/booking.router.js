import { Router } from "express"
import TGtripsRouter from './tourGuideTrips/routes.js'
import customTripRouter from './customTrip/router.js'

const router = Router()

router.use('/TGtrip', TGtripsRouter)
router.use('/custom', customTripRouter)

export default router