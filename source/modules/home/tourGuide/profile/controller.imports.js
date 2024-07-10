import { tourGuideModel } from '../../../../dataBase/models/tourGuide.model.js'
import { historicMP_Model } from '../../../../dataBase/models/historicMostPopular.js'
import bcrypt from 'bcrypt' // encryption
import cloudinary from "../../../../services/cloudinary.js" // cloudinary
import slugify from "slugify" // slug
import axios from 'axios' // for hitting requests internally (AI model requests)
import FormData from 'form-data'
import { generateToken, verifyToken } from "../../../../utilities/tokenFunctions.js" // token
import { customAlphabet } from 'nanoid' // custom id
import { emailService } from "../../../../services/mailService.js"
import { ReasonPhrases, StatusCodes } from 'http-status-codes'
import { systemRoles } from '../../../../utilities/systemRoles.js'
import { EGphoneCodes } from "../../../../utilities/phoneCodes.js"
import { statuses } from '../../../../utilities/activityStatuses.js'
import { languages, languagesCodes } from '../../../../utilities/languages.js'
import { countries, countriesCodes } from "../../../../utilities/nationalities.js"

export {
    bcrypt, cloudinary, tourGuideModel, slugify, generateToken, verifyToken, customAlphabet, emailService,
    ReasonPhrases, StatusCodes, systemRoles, EGphoneCodes, languages, statuses, languagesCodes,
    countries, countriesCodes, axios, FormData, historicMP_Model
}