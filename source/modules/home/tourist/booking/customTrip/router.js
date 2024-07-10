import { Router } from 'express'
import { validationCoreFunction } from '../../../../../middlewares/joiValidation.js'
import { isAuth } from '../../../../../middlewares/auth.js'
import { systemRoles } from '../../../../../utilities/systemRoles.js'
import { asyncHandler } from '../../../../../utilities/asyncHandler.js'

import * as cont from './controller.js'
import * as schemas from './schemas.js'

const roles = {
    basic: [systemRoles.tourist]
}

const router = Router()

router.post(
    '/createCustomTrip',
    isAuth(roles.basic),
    validationCoreFunction(schemas.createCustomTripSchema),
    asyncHandler(cont.createTrip)
)

router.get(
    '/getTrips',
    isAuth(roles.basic),
    validationCoreFunction(schemas.getTripsSchema),
    asyncHandler(cont.getAllTrips)
)

router.put(
    '/updateTrip',
    isAuth(roles.basic),
    validationCoreFunction(schemas.updateTripSchema),
    asyncHandler(cont.editTrip)
)

router.delete(
    '/deleteTrip',
    isAuth(roles.basic),
    validationCoreFunction(schemas.deleteTripSchema),
    asyncHandler(cont.deleteTrip)
)

export default router