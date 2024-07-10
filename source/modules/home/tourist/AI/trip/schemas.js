import { generalFields } from "../../../../../middlewares/joiValidation.js"
import joi from 'joi'

export const createAItrip = {
    body: joi.object({
        tripDetails: joi.object({}).required().unknown(true),
        title: joi.string().required(),
        from: joi.string().required(),
        to: joi.string().required()
    }),
    headers: joi.object({
        authorization: generalFields.jwtToken
    }).unknown(true)
}

export const getTripSchema = {
    body: joi.object({
        tripId: generalFields._id
    }),
    headers: joi.object({
        authorization: generalFields.jwtToken
    }).unknown(true)
}

export const getNearbySchema = {
    query: joi.object({
        long: joi.number().required(),
        lat: joi.number().required(),
        category: joi.string().valid('restaurants', 'hotels').optional()
    }).presence('required'),
    headers: joi.object({
        authorization: generalFields.jwtToken
    }).unknown(true)
}