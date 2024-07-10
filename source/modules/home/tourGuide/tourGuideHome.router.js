import { Router } from "express"
import { profileAPIroles } from "./profile/roles.js";
import { asyncHandler, isAuth, profileCont, profileVS, validationCoreFunction } from "./profile/routes.imports.js";

import tripRouter from './trip/routes.js'
import profileRouter from './profile/routes.js'
import settingsRouter from './settings/routes.js'
import notificationsRouter from './notification/routes.js'

const router = Router()

router.use('/myTrips', tripRouter)
router.use('/profile', profileRouter)
router.use('/settings', settingsRouter)
router.use('/notification', notificationsRouter)

router.post(
    '/logout',
    isAuth(profileAPIroles.logout),
    validationCoreFunction(profileVS.logout),
    asyncHandler(profileCont.logOut)
)

export default router