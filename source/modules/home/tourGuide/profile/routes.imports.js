import { Router } from 'express'
import { isAuth } from '../../../../middlewares/auth.js'
import { validationCoreFunction } from '../../../../middlewares/joiValidation.js'
import { asyncHandler } from '../../../../utilities/asyncHandler.js'
import { multerHostFunction } from '../../../../services/multerHost.js'
import * as profileCont from './controller.js'
import * as profileVS from './validationSchemas.js'
import { allowedExtensions } from '../../../../utilities/allowedUploadExtensions.js'
import { profileAPIroles } from './roles.js'

export {
    Router, isAuth, validationCoreFunction, asyncHandler, multerHostFunction, profileCont, profileVS, allowedExtensions,
    profileAPIroles
}