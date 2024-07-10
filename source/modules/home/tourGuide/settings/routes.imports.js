import { Router } from 'express'
import { isAuth } from '../../../../middlewares/auth.js'
import { validationCoreFunction } from '../../../../middlewares/joiValidation.js'
import { asyncHandler } from '../../../../utilities/asyncHandler.js'
import { multerHostFunction } from '../../../../services/multerHost.js'
import * as settingsCont from './controller.js'
import * as settingstVS from './validationSchemas.js'
import { allowedExtensions } from '../../../../utilities/allowedUploadExtensions.js'
import { settingsAPIroles } from './roles.js'

export {
    Router, isAuth, validationCoreFunction, asyncHandler, multerHostFunction, settingsCont, settingstVS, allowedExtensions,
    settingsAPIroles
}