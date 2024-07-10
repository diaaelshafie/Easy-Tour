import {
    Router, TG_trip_cont, TG_trip_vs, allowedExtensions, asyncHandler,
    isAuth, multerHostFunction, tripAPIroles, validationCoreFunction
} from './routes.imports.js'

const router = Router()

router.post(
    '/createTrip',
    isAuth(tripAPIroles.createTrip),
    multerHostFunction(allowedExtensions.image)
        .single('image')
    // .fields([
    //     { name: 'images', maxCount: 5 }
    // ])
    ,
    validationCoreFunction(TG_trip_vs.createTripSchema),
    asyncHandler(TG_trip_cont.generateTrip)
)

router.patch(
    '/editTrip',
    isAuth(tripAPIroles.editTrip),
    multerHostFunction(allowedExtensions.image).single('image'),
    validationCoreFunction(TG_trip_vs.editTripSchema),
    asyncHandler(TG_trip_cont.editTrip)
)

router.delete(
    '/deleteTrip',
    isAuth(tripAPIroles.deleteTrip),
    validationCoreFunction(TG_trip_vs.deleteTripSchema),
    asyncHandler(TG_trip_cont.deleteTrip)
)

router.get(
    '/getAllTrips',
    isAuth(tripAPIroles.getAllTrips),
    validationCoreFunction(TG_trip_vs.getAllTripsSchema),
    asyncHandler(TG_trip_cont.getAllTrips)
)

export default router