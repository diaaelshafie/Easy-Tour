import { Router } from 'express'
import * as TG_trip_cont from './controller.js'
import * as TG_trip_vs from './validationSchemas.js'
import { asyncHandler } from '../../../../utilities/asyncHandler.js'
import { isAuth } from '../../../../middlewares/auth.js'
import { multerHostFunction } from '../../../../services/multerHost.js'
import { validationCoreFunction } from '../../../../middlewares/joiValidation.js'
import { allowedExtensions } from '../../../../utilities/allowedUploadExtensions.js'
import { tripAPIroles } from './roles.js'

export {
    Router, TG_trip_cont, TG_trip_vs, allowedExtensions, asyncHandler,
    isAuth, multerHostFunction, tripAPIroles, validationCoreFunction
}