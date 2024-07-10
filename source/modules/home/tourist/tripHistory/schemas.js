import joi from 'joi'
import { generalFields } from '../../../../middlewares/joiValidation.js'
import { tripHistoryTripTypes } from '../../../../utilities/activityStatuses.js'

const schemaUtils = {
    headers: joi.object({
        authorization: generalFields.jwtToken
    }).presence('required').unknown(true)
}

export const getTripsHistory = {
    headers: schemaUtils.headers
}

export const reDoTrip = {
    headers: schemaUtils.headers,
    body: joi.object({
        tripID: generalFields._id,
        tripType: joi.string().valid(tripHistoryTripTypes.AI, tripHistoryTripTypes.custom, tripHistoryTripTypes.tg).required(),
        from: joi.date(),
        to: joi.date()
    }).when(
        joi.object({ tripType: joi.valid(tripHistoryTripTypes.AI, tripHistoryTripTypes.custom) }).unknown(), {
        then: joi.object({
            from: joi.required(),
            to: joi.date().required().greater(joi.ref('from'))
        }),
        otherwise: joi.object({
            from: joi.optional(),
            to: joi.optional()
        })
    }
    )
}

export const deleteTrip = {
    headers: schemaUtils.headers,
    body: joi.object({
        tripID: generalFields._id,
        tripType: joi.string().valid(tripHistoryTripTypes.AI, tripHistoryTripTypes.custom, tripHistoryTripTypes.tg).required(),
    }).presence('required')
}