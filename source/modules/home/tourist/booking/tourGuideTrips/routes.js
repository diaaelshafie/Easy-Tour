import {
    BookingCont, BookingRoles, BookingVS, Router, asyncHandler, multerCallBackVersion, multerHostFunction,
    multertempFunction, validationCoreFunction, isAuth
} from './routes.imports.js'

const router = Router()

router.get(
    '/getTripsLength',
    isAuth(BookingRoles.GetTG_trips),
    asyncHandler(BookingCont.getTripsLength)
)

router.get(
    '/getAllTrips',
    isAuth(BookingRoles.GetTG_trips),
    validationCoreFunction(BookingVS.getAllTourGuideTrips),
    asyncHandler(BookingCont.getAllTrips)
)

router.get(
    '/viewTourGuide',
    isAuth(BookingRoles.viewTourGuide),
    validationCoreFunction(BookingVS.viewTourGuide),
    asyncHandler(BookingCont.getTheTourGuideProfile)
)

router.post(
    '/tripRequest',
    isAuth(BookingRoles.BookATrip),
    validationCoreFunction(BookingVS.requestAtripSchema),
    asyncHandler(BookingCont.requestToJoinTrip)
)

export default router