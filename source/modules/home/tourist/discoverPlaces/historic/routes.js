import {
    Router, historyMP_cont, historyMP_vs, isAuth,
    multerHostFunction, validationCoreFunction, allowedExtensions,
    asyncHandler, historicAPIroles
} from './routes.imports.js'

const router = Router()

router.get(
    '/getAllPlaces',
    validationCoreFunction(historyMP_vs.getAllPlacesSchema),
    asyncHandler(historyMP_cont.getAllPlacesData)
)

router.put(
    '/placeToggleFav',
    isAuth(historicAPIroles.toggleToFavs),
    validationCoreFunction(historyMP_vs.toggleToFavsSchema),
    asyncHandler(historyMP_cont.placeToggleFav)
)

router.post(
    '/addData',
    multerHostFunction(allowedExtensions.image).single('image'),
    validationCoreFunction(historyMP_vs.addPlaceSchema),
    asyncHandler(historyMP_cont.addData)
)

router.patch(
    '/editData',
    multerHostFunction(allowedExtensions.image).single('image'),
    validationCoreFunction(historyMP_vs.editPlaceSchema),
    asyncHandler(historyMP_cont.editData)
)

// deprecated
router.get(
    '/getPlaceInfo',
    validationCoreFunction(historyMP_vs.editPlaceSchema),
    asyncHandler(historyMP_cont.getPlaceData)
)

// deprecated
router.get(
    '/getAllPlacesThumbs',
    validationCoreFunction(historyMP_vs.getAllPlacesSchema),
    asyncHandler(historyMP_cont.getAllPlaces)
)

router.delete(
    '/deletePlace',
    validationCoreFunction(historyMP_vs.deletePlaceSchema),
    asyncHandler(historyMP_cont.deletePlace)
)

export default router