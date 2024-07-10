import { Router } from 'express'
import { multerHostFunction } from '../../../../../services/multerHost.js'
import { validationCoreFunction } from '../../../../../middlewares/joiValidation.js'
import { allowedExtensions } from '../../../../../utilities/allowedUploadExtensions.js'
import { isAuth } from '../../../../../middlewares/auth.js'
import { asyncHandler } from '../../../../../utilities/asyncHandler.js'
import * as entertainment_cont from './controller.js'
import * as entertainment_vs from './validationSchemas.js'

export {
    Router, entertainment_cont, entertainment_vs, isAuth,
    multerHostFunction, validationCoreFunction, allowedExtensions,
    asyncHandler
}