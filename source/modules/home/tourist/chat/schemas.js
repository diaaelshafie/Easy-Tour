import joi from 'joi'
import { generalFields } from '../../../../middlewares/joiValidation.js'
import { messageTypes } from '../../../../utilities/activityStatuses.js'

export const getRecentChatsSchema = {
    headers: joi.object({
        authorization: generalFields.jwtToken
    }).presence('required').unknown(true)
}

export const getChatSchema = {
    // body: joi.object({
    //     chatID: generalFields._id
    // }),
    headers: joi.object({
        authorization: generalFields.jwtToken,
        chatid: generalFields._id
    }).presence('required').unknown(true)
}

export const getTGMetaSchema = {
    headers: joi.object({
        authorization: generalFields.jwtToken
    }).presence('required').unknown(true)
}

export const sendMessageSchema = {
    body: joi.object({
        destEmail: generalFields.email,
        message: joi.string().min(1).max(255),
        messageType: joi.string().valid(messageTypes.image, messageTypes.text, messageTypes.video, messageTypes.voice, messageTypes.audio)
    }),
    headers: joi.object({
        authorization: generalFields.jwtToken
    }).presence('required').unknown(true)
}