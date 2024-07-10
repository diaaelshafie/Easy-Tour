import joi from 'joi'
import { Types } from 'mongoose'

const validationObjectId = (value, helper) => {
    return Types.ObjectId.isValid(value) ? true : helper.message('invalid _id format')
}

export const generalFields = {
    email: joi.string().email({ tlds: { allow: ['com', 'net', 'org'] } }).required(),
    optionalEmail: joi.string().email({ tlds: { allow: ['com', 'net', 'org'] } }),
    // QUESTION : WHAT IS PASSWORD USED FOR ? , is there any case that the user will send a hashed password ?
    password: joi.string()
        .regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)
        .messages({
            'string.pattern.base': 'password regex fail'
        }).required(),
    _id: joi.string().custom(validationObjectId),
    jwtToken: joi.string().pattern(/^[A-Za-z0-9-_]+ [A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/)
    // joi.string().pattern(/^[A-Za-z0-9-_]\[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/)
}

export const validationCoreFunction = (schema) => {
    console.log("\nVALIDATION\n")
    const reqElements = ['body', 'params', 'query', 'headers', 'file', 'files'] // known parts of the request object (they are also objects)
    return async (req, res, next) => {
        const validationErrors = []
        const validationErrorsMessages = []
        for (const key of reqElements) {
            if (schema[key]) {
                const validation = await schema[key].validate(req[key], { abortEarly: false })
                if (validation.error) {
                    validationErrors.push(validation.error.details)
                    validationErrorsMessages.push(validation.error.message)
                }
            }
        }
        if (validationErrors.length) {
            console.log({ validation_errors: validationErrors, validation_messages: validationErrorsMessages })
            // return res.status(400).json({
            //     message: "validation error(s)!",
            //     Errors: validationErrors
            // })
            req.validationErrors = validationErrors
            console.log({ request_validation_errors: req.validationErrors })
            return next(new Error({ ...validationErrors }, { cause: 400 }))
        }
        console.log("\nVALIDATION IS SUCCESSFUL\n")
        next()
    }
}