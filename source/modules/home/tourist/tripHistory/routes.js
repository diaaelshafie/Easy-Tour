import { Router } from 'express'
import { validationCoreFunction } from '../../../../middlewares/joiValidation.js'
import * as cont from './controller.js'
import * as schemas from './schemas.js'
import { isAuth } from '../../../../middlewares/auth.js'
import { systemRoles } from "../../../../utilities/systemRoles.js"
import { asyncHandler } from '../../../../utilities/asyncHandler.js'

const router = Router()
// .route('/tripManager')
//     .get(
//         isAuth([systemRoles.tourist]),
//         validationCoreFunction(schemas.getTripsHistory),
//         asyncHandler(cont.getAllTrips)
//     )
// this code below would make errors 

router.route('/tripManager')
    .get(
        isAuth([systemRoles.tourist]),
        validationCoreFunction(schemas.getTripsHistory),
        asyncHandler(cont.getAllTrips)
    )
    .patch(
        isAuth([systemRoles.tourist]),
        validationCoreFunction(schemas.reDoTrip),
        asyncHandler(cont.reDoTrip)
    )
    .delete(
        isAuth([systemRoles.tourist]),
        validationCoreFunction(schemas.deleteTrip),
        asyncHandler(cont.deleteTrip)
    )
// router.get(
//     '/getTrips',
//     isAuth([systemRoles.tourist]),
//     validationCoreFunction(schemas.getTripsHistory),
//     asyncHandler(cont.getAllTrips)
// )

// router.patch(
//     '/redoTrip'
// )

export default router