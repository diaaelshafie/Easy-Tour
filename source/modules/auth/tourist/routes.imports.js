import { Router } from 'express'
import { validationCoreFunction } from '../../../middlewares/joiValidation.js'
import { asyncHandler } from '../../../utilities/asyncHandler.js'
import { multerHostFunction } from '../../../services/multerHost.js'
import * as touristCont from './controller.js'
import * as touristVS from './validationSchemas.js'
import { allowedExtensions } from '../../../utilities/allowedUploadExtensions.js'
import { touristAPIroles } from './roles.js'

export {
    Router, validationCoreFunction, asyncHandler, multerHostFunction, touristCont, touristVS, allowedExtensions,
    touristAPIroles
}