import joi from 'joi'
import { generalFields } from '../../../middlewares/joiValidation.js'

export const signUpValidSchema = {
    // userName , pass , email
    body: joi.object({
        userName: joi.string().required(),
        email: generalFields.email,
        password: generalFields.password,
        confirmPassword: joi.string().valid(joi.ref('password')).messages({
            'password.confirm.status': 'failed'
        }).required(),
        phoneNumber: joi.string().length(10).optional(),
        gender: joi.string().valid('male', 'female').optional(),
        age: joi.number().optional(),
        language: joi.array().items(joi.string()),
        countryFlag: joi.string()
    }),
    files: joi.object().presence('forbidden')
}

export const confirmAccountSchema = {
    params: joi.object({
        // TODO : fix the jwt token validation regex
        confirmToken: joi.string()
    }).presence('required')
}

export const GmailLoginSchema = {
    body: joi.object({
        idToken: joi.string().required()
    }).presence('required')
}

export const touristLoginSchema = {
    body: joi.object({
        email: generalFields.email,
        password: joi.string()
    }).presence('required')
}

export const touristForgetPassSchema = {
    body: joi.object({
        email: generalFields.email
    })
}

export const touristResetPassSchema = {
    params: joi.object({
        token: joi.string()
    }),
    body: joi.object({
        newPassword: generalFields.password
    })
}

// files: joi.object({
//     profilePicture: joi.array().items(joi.object({
//         fieldname: joi.string(),
//         originalname: joi.string(),
//         encoding: joi.string(),
//         mimetype: joi.string(),
//         destination: joi.string(),
//         filename: joi.string(),
//         path: joi.string(),
//         size: joi.number()
//     })),
//     coverPicture: joi.array().items(joi.object({
//         fieldname: joi.string(),
//         originalname: joi.string(),
//         encoding: joi.string(),
//         mimetype: joi.string(),
//         destination: joi.string(),
//         filename: joi.string(),
//         path: joi.string(),
//         size: joi.number()
//     }))
// }).unknown(true).presence('optional').options({ presence: 'optional' })