import {
    Router, validationCoreFunction, asyncHandler, multerHostFunction, touristCont, touristVS, allowedExtensions,
    touristAPIroles
} from './routes.imports.js'

const router = Router()

// TODO : remove the multer line (it makes a validation error when it is removed)
router.post(
    '/signUp',
    validationCoreFunction(touristVS.signUpValidSchema),
    asyncHandler(touristCont.TouristSignUp)
)

router.get(
    '/confirmAccount:confirmToken',
    validationCoreFunction(touristVS.confirmAccountSchema),
    asyncHandler(touristCont.confirmAccount)
)

router.post(
    '/loginWithGmail',
    validationCoreFunction(touristVS.GmailLoginSchema),
    asyncHandler(touristCont.logInWithGmail)
)

router.post(
    '/logIn',
    validationCoreFunction(touristVS.touristLoginSchema),
    asyncHandler(touristCont.touristLogIn)
)

router.patch(
    '/forgetPassword',
    validationCoreFunction(touristVS.touristForgetPassSchema),
    asyncHandler(touristCont.forgetPassword)
)

router.patch(
    '/resetPassword:token',
    validationCoreFunction(touristVS.touristResetPassSchema),
    asyncHandler(touristCont.resetPassword)
)

export default router