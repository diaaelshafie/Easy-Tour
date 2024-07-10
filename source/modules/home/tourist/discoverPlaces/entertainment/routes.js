import { historicAPIroles } from '../historic/roles.js'
import {
    Router, entertainment_cont, entertainment_vs, isAuth,
    multerHostFunction, validationCoreFunction, allowedExtensions,
    asyncHandler
} from './routes.imports.js'

const router = Router()

router.post(
    '/addData',
    multerHostFunction(allowedExtensions.image).single('image'),
    validationCoreFunction(entertainment_vs.addPlaceSchema),
    asyncHandler(entertainment_cont.addData)
)

router.put(
    '/placeToggleFav',
    isAuth(historicAPIroles.toggleToFavs),
    validationCoreFunction(entertainment_vs.toggleToFavsSchema),
    asyncHandler(entertainment_cont.placeToggleFav)
)

router.patch(
    '/editData',
    multerHostFunction(allowedExtensions.image).single('image'),
    validationCoreFunction(entertainment_vs.editPlaceSchema),
    asyncHandler(entertainment_cont.editData)
)

// deprecated
router.get(
    '/getPlaceInfo',
    validationCoreFunction(entertainment_vs.editPlaceSchema),
    asyncHandler(entertainment_cont.getPlaceData)
)

// deprecated
router.get(
    '/getAllPlacesThumbs',
    validationCoreFunction(entertainment_vs.getAllPlacesSchema),
    asyncHandler(entertainment_cont.getAllPlaces)
)

router.get(
    '/getAllPlaces',
    validationCoreFunction(entertainment_vs.getAllPlacesSchema),
    asyncHandler(entertainment_cont.getAllPlacesData)
)

router.delete(
    '/deletePlace',
    validationCoreFunction(entertainment_vs.deletePlaceSchema),
    asyncHandler(entertainment_cont.deletePlace)
)
export default router