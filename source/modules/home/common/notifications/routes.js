import {
    Router, asyncHandler, isAuth, validationCoreFunction
} from '../routes.imports.js'
import * as controllers from './controller.js'
import * as schemas from './schemas.js'
import { commonNotifRoles } from './roles.js'

const router = Router()

router.all('*', isAuth(commonNotifRoles.storeFCMPushToken))

router.put(
    '/storePushToken',
    validationCoreFunction(schemas.storeFCMPushTokenSchema),
    asyncHandler(controllers.storeFCMPushToken)
)

export default router