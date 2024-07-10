import joi from 'joi'
import { generalFields } from '../../../../middlewares/joiValidation.js'

export const viewProfileSchmea = {
    headers: joi.object({
        authorization: generalFields.jwtToken
    }).presence('required').unknown(true)
}

export const logout = {
    headers: joi.object({
        authorization: generalFields.jwtToken
    }).presence('required').unknown(true)
}

export const updateProfileSchema = {
    body: joi.object({
        firstName: joi.string(),
        lastName: joi.string(),
        address: joi.string(),
        birthDate: joi.string(),
        phoneNumber: joi.string(),
        description: joi.string(),
        contactInfo: joi.object({
            whatsapp: joi.string(),
            facebook: joi.string(),
            instagram: joi.string(),
            linkedIn: joi.string(),
            twitter: joi.string()
        }).presence('optional')
    }).presence('optional'),
    files: joi.object({
        profilePicture: joi.array().items(joi.object({
            fieldname: joi.string(),
            originalname: joi.string(),
            encoding: joi.string(),
            mimetype: joi.string(),
            destination: joi.string(),
            filename: joi.string(),
            path: joi.string(),
            size: joi.number()
        })).optional(),
        CV: joi.array().items(joi.object({
            fieldname: joi.string(),
            originalname: joi.string(),
            encoding: joi.string(),
            mimetype: joi.string(),
            destination: joi.string(),
            filename: joi.string(),
            path: joi.string(),
            size: joi.number()
        })).optional()
    }),
    headers: joi.object({
        authorization: generalFields.jwtToken
    }).presence('required').unknown(true)
}