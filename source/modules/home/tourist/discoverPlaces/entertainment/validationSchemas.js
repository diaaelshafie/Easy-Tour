import joi from 'joi'
import { generalFields } from '../../../../../middlewares/joiValidation.js'

export const addPlaceSchema = {
    body: joi.object({
        name: joi.string().required(),
        type: joi.string().valid('cinema', 'restaurant', 'museum', 'bazar', 'medical').required(),
        location: joi.object({
            longitude: joi.number().optional(),
            latitude: joi.number().optional(),
        }).optional(true),
        details: joi.string().min(300).required(),
        ticket_price: joi.number().min(0).required()
    }).presence('required'),
    file: joi.object({
        fieldname: joi.string(),
        originalname: joi.string(),
        encoding: joi.string(),
        mimetype: joi.string(),
        destination: joi.string(),
        filename: joi.string(),
        path: joi.string(),
        size: joi.number()
    }).presence('required')
}

export const editPlaceSchema = {
    body: joi.object({
        name: joi.string().required(),
        type: joi.string().valid('cinema', 'restaurant', 'museum', 'bazar', 'medical').optional(),
        location: joi.object({
            longitude: joi.number().optional(),
            latitude: joi.number().optional(),
        }).optional(true),
        details: joi.string().min(300).optional(),
        ticket_price: joi.number().min(0).optional()
    }).presence('required'),
    file: joi.object({
        fieldname: joi.string(),
        originalname: joi.string(),
        encoding: joi.string(),
        mimetype: joi.string(),
        destination: joi.string(),
        filename: joi.string(),
        path: joi.string(),
        size: joi.number()
    }).presence('optional')
}

export const getPlaceDataSchema = {
    body: joi.object({
        name: joi.string().required()
    }).presence('required')
}

export const getAllPlacesSchema = {
    body: joi.object({
        type: joi.string().required()
    }).presence('required'),
    file: joi.object().presence('forbidden'),
    files: joi.object().presence('forbidden'),
    headers: joi.object({
        authorization: generalFields.jwtToken
    }).presence('required').unknown(true)
}

export const deletePlaceSchema = {
    body: joi.object({
        name: joi.alternatives().try(
            joi.string().required(),
            joi.array().items(joi.string()).required()
        )
    }).presence('required')
}

export const toggleToFavsSchema = {
    body: joi.object({
        placeName: joi.string().required()
    }).presence('required'),
    headers: joi.object({
        authorization: generalFields.jwtToken
    }).presence('required').unknown(true)
}