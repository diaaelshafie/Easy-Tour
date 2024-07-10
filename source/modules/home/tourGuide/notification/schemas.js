import { generalFields } from "../../../../middlewares/joiValidation.js"
import { tripRequestAnswer } from '../../../../utilities/activityStatuses.js'
import joi from 'joi'

export const getAllRequestsSchema = {
    headers: joi.object({
        authorization: generalFields.jwtToken
    }).presence('required').unknown(true)
}

export const handleRequestSchema = {
    body: joi.object({
        requestID: generalFields._id,
        answer: joi.string().valid(tripRequestAnswer.yes, tripRequestAnswer.no).required(),
        tripID: generalFields._id
    }).presence('required'),
    headers: joi.object({
        authorization: generalFields.jwtToken
    }).presence('required').unknown(true)
}
