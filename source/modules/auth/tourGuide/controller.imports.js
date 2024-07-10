import bcrypt from 'bcrypt' // encryption
import slugify from "slugify" // slug
import axios from 'axios' // for hitting requests internally (AI model requests)
import FormData from 'form-data'
import fs from 'fs'
import path from 'path'
import fsPromise from 'fs/promises'
import queryString from "query-string"
import { customAlphabet } from 'nanoid' // custom id
import { ReasonPhrases, StatusCodes } from 'http-status-codes'
import { tourGuideModel } from "../../../dataBase/models/tourGuide.model.js"
import cloudinary from "../../../services/cloudinary.js" // cloudinary
import { generateToken, verifyToken } from "../../../utilities/tokenFunctions.js" // token
import { emailService } from "../../../services/mailService.js"
import { systemRoles } from '../../../utilities/systemRoles.js'
import { EGphoneCodes } from "../../../utilities/phoneCodes.js"
import { statuses } from '../../../utilities/activityStatuses.js'
import { checkUserExists } from '../../../utilities/signUpCheck.js'
import { OAuth2Client } from 'google-auth-library'

export {
    EGphoneCodes, FormData, ReasonPhrases, StatusCodes, axios, bcrypt, cloudinary,
    customAlphabet, emailService, generateToken, verifyToken, slugify, statuses, systemRoles,
    tourGuideModel, fs, path, fsPromise, queryString, checkUserExists, OAuth2Client
}