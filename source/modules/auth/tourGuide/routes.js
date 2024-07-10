import {
    Router, TG_cont, TG_vs, allowedExtensions, asyncHandler,
    validationCoreFunction, multertempFunction
} from './routes.imports.js'

const router = Router()

router.post(
    '/signUp',
    multertempFunction([...allowedExtensions.image, ...allowedExtensions.application]).fields([
        { name: "profilePicture", maxCount: 1 },
        { name: "ministryID", maxCount: 1 },
        { name: "syndicateID", maxCount: 1 },
        { name: "CV", maxCount: 1 }
    ]),
    validationCoreFunction(TG_vs.signUpSchema),
    asyncHandler(TG_cont.TG_signUp)
)

router.post(
    '/imgRecTest',
    multertempFunction([...allowedExtensions.application, ...allowedExtensions.image]).fields([
        { name: "syndicateID", maxCount: 1 },
        { name: "ministryID", maxCount: 1 }
    ]),
    asyncHandler(TG_cont.imageRecTest)
)

router.get(
    '/confirmAccount:confirmToken',
    validationCoreFunction(TG_vs.confirmAccountSchema),
    asyncHandler(TG_cont.TG_confirmAccount)
)

router.post(
    '/logIn',
    validationCoreFunction(TG_vs.loginSchema),
    asyncHandler(TG_cont.TG_login)
)

router.patch(
    '/forgetPassword',
    validationCoreFunction(TG_vs.forgetPasswordSchema),
    asyncHandler(TG_cont.TG_forgetPassword)
)

router.patch(
    '/resetPassword:token',
    validationCoreFunction(TG_vs.resetPasswordSchema),
    asyncHandler(TG_cont.TG_resetPassword)
)

export default router