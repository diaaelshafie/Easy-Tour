import { Router } from "express";
import { validationCoreFunction } from '../../../middlewares/joiValidation.js'
import { asyncHandler } from '../../../utilities/asyncHandler.js'
import { multertempFunction } from '../../../services/multerHost.js'
import { allowedExtensions } from '../../../utilities/allowedUploadExtensions.js'
import * as TG_cont from './controller.js'
import * as TG_vs from './validationSchemas.js'

export {
    Router, allowedExtensions, asyncHandler,
    validationCoreFunction, TG_cont, TG_vs, multertempFunction
}