import { generalFields } from '../../../../middlewares/joiValidation.js'
import joi from 'joi'

export const storeFCMPushTokenSchema = {
    body: joi.object({
        pushToken: joi.string().optional(),
        action: joi.string().valid('enable', 'disable', 'refresh').required()
    }),
    headers: joi.object({
        authorization: generalFields.jwtToken
    }).presence('required').unknown(true)
}