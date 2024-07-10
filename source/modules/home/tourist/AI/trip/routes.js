import {
    AItripAPIroles, AIcont, AIvs, Router, asyncHandler, isAuth,
    multerHostFunction, validationCoreFunction
} from './routes.imports.js'

const router = Router()

router.post(
    '/createTrip',
    isAuth(AItripAPIroles.createTrip),
    validationCoreFunction(AIvs.createAItrip),
    asyncHandler(AIcont.createAItrip)
)

router.get(
    '/getTrip',
    isAuth(AItripAPIroles.createTrip),
    validationCoreFunction(AIvs.getTripSchema),
    asyncHandler(AIcont.getTrip)
)

router.get(
    '/getNearbyPlaces',
    isAuth(AItripAPIroles.createTrip),
    validationCoreFunction(AIvs.getNearbySchema),
    asyncHandler(AIcont.getNearbyPlaces)
)

export default router