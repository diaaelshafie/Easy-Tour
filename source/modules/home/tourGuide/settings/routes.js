import {
    Router, isAuth, validationCoreFunction, asyncHandler, multerHostFunction, settingsCont, settingstVS, allowedExtensions,
    settingsAPIroles
} from './routes.imports.js'

const router = Router()

router.get(
    '/confirmOldPassword',
    isAuth(settingsAPIroles.changePassword),
    validationCoreFunction(settingstVS.confirmOldPasswordSchema),
    asyncHandler(settingsCont.confrirmOldPass)
)

router.patch(
    '/changeoldPass',
    isAuth(settingsAPIroles.changePassword),
    validationCoreFunction(settingstVS.changeOldPassSchema),
    asyncHandler(settingsCont.changeOldPass)
)

router.delete(
    '/deleteUser',
    isAuth(settingsAPIroles.deleteUser),
    validationCoreFunction(settingstVS.deleteUser),
    asyncHandler(settingsCont.new_deleteUser)
)

router.delete(
    '/deleteAssocTripsTest',
    isAuth(settingsAPIroles.deleteUser),
    validationCoreFunction(settingstVS.deleteUser),
    asyncHandler(settingsCont.deleteAssocTrips_test)
)

export default router