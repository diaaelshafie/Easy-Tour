import joi from 'joi'
import { generalFields } from '../../../../../middlewares/joiValidation.js'
import { categoryValues } from '../../../../../dataBase/models/customTrip.model.js'

const tripDayPlacesData = {
    placeName: joi.string(),
    latitude: joi.number().min(0),
    longitude: joi.number().min(0),
    category: joi.string().valid(...categoryValues),
    government: joi.string(),
    image: joi.string(),
    activity: joi.string(),
    priceRange: joi.number().min(0)
}

const tripDaysData = {
    dayName: joi.string().required(),
    dayPlaces: joi.array().items(joi.object(tripDayPlacesData)).required()
}

const tripData = {
    // everything is required
    forPost: {
        title: joi.string().required(),
        startDate: joi.string().required(),
        endDate: joi.string().required(),
        tripDetails: joi.array().items(joi.object(tripDaysData)).required()
    },
    // everything is optional
    forUpdate: {
        title: joi.string().optional(),
        startDate: joi.string().optional(),
        endDate: joi.string().optional(),
        tripDetails: joi.array().items(joi.object(tripDaysData)).optional()
    }
}

const queryData = {
    query: joi.object({
        tripId: generalFields._id
    })
}

const headersValidation = {
    headers: joi.object({
        authorization: generalFields.jwtToken
    }).unknown(true)
}

export const createCustomTripSchema = {
    body: joi.object(tripData.forPost),
    ...headersValidation
}

export const getTripsSchema = {
    ...headersValidation
}

export const updateTripSchema = {
    body: joi.object({
        ...tripData.forUpdate,
    }),
    ...headersValidation,
    ...queryData
}

export const deleteTripSchema = {
    ...headersValidation,
    ...queryData
}