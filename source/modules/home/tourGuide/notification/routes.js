import {
    Router, asyncHandler, isAuth, noteCont, noteRoles, noteVS, validationCoreFunction
} from './routes.imports.js'

const router = Router()

/*
 this is used in a module where you want to make a middleware invoked in all what's requested in this router but :
 since this module is planned to be used by more than one entity , then it might change in the future and reverted to the old use
*/
router.all('*', isAuth(noteRoles.notificationRoles.openNotification))

router.get(
    '/getAllRequests',
    validationCoreFunction(noteVS.getAllRequestsSchema),
    asyncHandler(noteCont.getAllRequests)
)

router.patch(
    '/handleRequest',
    validationCoreFunction(noteVS.handleRequestSchema),
    asyncHandler(noteCont.handleRequest)
)

export default router