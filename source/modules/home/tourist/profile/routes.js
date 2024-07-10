import {
    Router, isAuth, validationCoreFunction, asyncHandler, multerHostFunction, profileCont, profileVS, allowedExtensions,
    profileAPIroles
} from './routes.imports.js'

const router = Router()

router.get(
    '/getProfile',
    isAuth(profileAPIroles.getUserInfo),
    validationCoreFunction(profileVS.viewProfileSchmea),
    asyncHandler(profileCont.getUserInfo)
)

router.get(
    '/getAllFavPlaces',
    isAuth(profileAPIroles.getAllFavPlaces),
    validationCoreFunction(profileVS.getAllFavPlacesSchema),
    asyncHandler(profileCont.getAllFavPlaces)
)

router.post(
    '/profileSetUp',
    isAuth(profileAPIroles.profile_setUp),
    multerHostFunction(allowedExtensions.image).fields([
        { name: 'profilePicture', maxCount: 1 },
        { name: 'coverPicture', maxCount: 1 }
    ]),
    validationCoreFunction(profileVS.touristProfileSetUpSchema),
    asyncHandler(profileCont.profileSetUp)
)

export default router