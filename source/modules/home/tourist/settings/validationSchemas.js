import joi from 'joi'
import { generalFields } from '../../../../middlewares/joiValidation.js'

export const deleteUser = {
    headers: joi.object({
        authorization: generalFields.jwtToken
    }).presence('required').unknown(true)
}

export const confirmOldPasswordSchema = {
    body: joi.object({
        oldPassword: generalFields.password
    }).presence('required'),
    headers: joi.object({
        authorization: generalFields.jwtToken
    }).presence('required').unknown(true)
}

export const changeOldPassSchema = {
    body: joi.object({
        newPassword: generalFields.password,
        confirmNewPassword: joi.string().valid(joi.ref('newPassword')).messages({
            'password.confirm.status': 'failed'
        })
    }).presence('required'),
    // params: joi.object({
    //     passToken: joi.string()
    // }).presence('required'),
    headers: joi.object({
        authorization: generalFields.jwtToken
    }).presence('required').unknown(true)
}