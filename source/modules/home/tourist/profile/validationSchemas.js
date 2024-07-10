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

export const getAllFavPlacesSchema = {
    headers: joi.object({
        authorization: generalFields.jwtToken
    }).presence('required').unknown(true)
}

export const touristProfileSetUpSchema = {
    body: joi.object({
        phoneNumber: joi.string().length(10),
        gender: joi.string().valid('male', 'female'),
        age: joi.number(),
        language: joi.string(),
        country: joi.string(),
        preferences: joi.array().items(joi.string()),
        countryFlag: joi.string()
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
        })),
        coverPicture: joi.array().items(joi.object({
            fieldname: joi.string(),
            originalname: joi.string(),
            encoding: joi.string(),
            mimetype: joi.string(),
            destination: joi.string(),
            filename: joi.string(),
            path: joi.string(),
            size: joi.number()
        }))
    }).unknown(true).options({ presence: 'optional' }),
    headers: joi.object({
        authorization: generalFields.jwtToken
    }).presence('required').unknown(true)
}