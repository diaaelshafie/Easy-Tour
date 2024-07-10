import { Router } from 'express'
import { multerHostFunction } from '../../../../../services/multerHost.js'
import { validationCoreFunction } from '../../../../../middlewares/joiValidation.js'
import { allowedExtensions } from '../../../../../utilities/allowedUploadExtensions.js'
import { isAuth } from '../../../../../middlewares/auth.js'
import { asyncHandler } from '../../../../../utilities/asyncHandler.js'
import * as historyMP_cont from './controller.js'
import * as historyMP_vs from './validationSchemas.js'
import { historicAPIroles } from './roles.js'

export {
    Router, historyMP_cont, historyMP_vs, isAuth,
    multerHostFunction, validationCoreFunction, allowedExtensions,
    asyncHandler, historicAPIroles
}