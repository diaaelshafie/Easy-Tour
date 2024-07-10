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

router.patch(
    '/updateProfile',
    isAuth(profileAPIroles.updateProfile),
    multerHostFunction([...allowedExtensions.image, ...allowedExtensions.application])
        .fields([
            { name: "profilePicture", maxCount: 1 },
            { name: "CV", maxCount: 1 }
        ]),
    validationCoreFunction(profileVS.updateProfileSchema),
    asyncHandler(profileCont.TG_updateProfile)
)


export default router