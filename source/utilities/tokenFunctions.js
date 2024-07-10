import jwt from 'jsonwebtoken'

// generate token method :
export const generateToken = ({
    payload = {},
    signature = process.env.DEFAULT_SECRET_KEY,
    expiresIn = '1d'
}) => {
    if (!Object.keys(payload).length) {
        return false
    }
    const token = jwt.sign(payload, signature, { expiresIn })
    return token
}

// verify : 
export const verifyToken = ({
    token = '',
    // DEFAULT_SECRET_KEY is used if there is not token signature sent as an argument to any of those 2 functions which is unpreferred
    signature = process.env.DEFAULT_SECRET_KEY
}) => {
    if (!token) {
        return false
    }
    const checkToken = jwt.verify(token, signature)
    return checkToken
}