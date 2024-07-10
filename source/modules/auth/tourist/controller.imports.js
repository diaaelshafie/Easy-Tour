import { touristModel } from "../../../dataBase/models/tourist.model.js" // DB model
import bcrypt from 'bcrypt' // encryption
import cloudinary from "../../../services/cloudinary.js" // cloudinary
import slugify from "slugify" // slug
import { generateToken, verifyToken } from "../../../utilities/tokenFunctions.js" // token
import { customAlphabet } from 'nanoid' // custom id
import { emailService } from "../../../services/mailService.js"
import { ReasonPhrases, StatusCodes } from 'http-status-codes'
import { systemRoles } from '../../../utilities/systemRoles.js'
import { statuses } from '../../../utilities/activityStatuses.js'
import { checkUserExists } from '../../../utilities/signUpCheck.js'
import { OAuth2Client } from 'google-auth-library'
import { socialProviders } from '../../../utilities/socialProviders.js'

export {
    ReasonPhrases, StatusCodes, bcrypt, cloudinary,
    customAlphabet, emailService, generateToken, slugify, statuses, systemRoles, verifyToken,
    touristModel, checkUserExists, OAuth2Client, socialProviders
}