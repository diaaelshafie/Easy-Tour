import { deleteTempFiles } from '../../../utilities/tempFiles.js'
import {
    EGphoneCodes, FormData, ReasonPhrases, StatusCodes, axios, bcrypt, cloudinary,
    customAlphabet, emailService, generateToken, verifyToken, slugify, statuses, systemRoles,
    tourGuideModel, fs, path, fsPromise, queryString, checkUserExists, OAuth2Client
} from './controller.imports.js'

// mininstryID -> direct to data base
// syndicateID -> OCR first
// profile picture -> direct to data base

// for tourist sign up :
const nanoid = customAlphabet('asdfghjkl123456789_#$%!', 5)
// for password reset :
const nanoid2 = customAlphabet('1234567890', 6)

export const TG_signUp = async (req, res, next) => {
    console.log("\nTOUR GUIDE SIGNUP\n")

    console.log({
        request_body: req.body,
        languages_type: typeof (req.body.languages)
    })

    const { firstName, lastName, languages, address, description,
        birthDate, phoneNumber, email, password, confirmPassword
    } = req.body

    const findUser = await checkUserExists(email)
    console.log({ foundUser: findUser })
    if (findUser.found == true) {
        return next(new Error(`${findUser.message}`, { cause: StatusCodes.BAD_REQUEST }))
    }
    console.log({ message: findUser.message, is_user_found: findUser.found })

    if (password !== confirmPassword) {
        console.log({
            user_API_message: "the entered password and it's confirm don't match",
            entered_password: password,
            entered_confirm_password: confirmPassword
        })
        return next(new Error('passwords must match', { cause: 400 }))
    }
    console.log({
        message: "entered passwords matched!"
    })

    const firsNameSlug = slugify(firstName, '_')
    const lastNameSlug = slugify(lastName, '_')

    if (phoneNumber.length !== 10) {
        console.log({
            user_error_message: "user didn't enter a valid phone number length",
            required_length: "10",
            entered_length: phoneNumber.length
        })
        return next(new Error("enter a valid phone number!", { cause: 400 }))
    }
    if (!EGphoneCodes.includes(phoneNumber.slice(0, 2))) {
        console.log({
            user_error_message: "user didn't enter a valid phone number code",
            valid_codes: "10 || 11 || 12 || 15",
            entered_code: phoneNumber.slice(0, 2)
        })
        return next(new Error("please enter an egyptian number!", { cause: 400 }))
    }
    console.log({ message: "the entered phone number is valid!" })

    // TODO : make a format for the birth date
    // TODO : make a format for the address

    const userData = {
        firstName,
        lastName,
        firsNameSlug,
        lastNameSlug,
        address,
        birthDate,
        phoneNumber,
        email
    }
    console.log({
        message: "initial data is added!"
    })

    if (description) {
        console.log({
            message: "description is found!",
            description_added: description
        })
        userData.description = description
    } else { console.log({ message: "no tour guide description was given" }) }

    const hashedPassword = bcrypt.hashSync(password, +process.env.SIGN_UP_SALT_ROUNDS)
    userData.password = hashedPassword
    console.log({
        message: "tour guide password is added!"
    })

    console.log({
        request_files: req.files,
        profileArray: req.files['profilePicture'],
        ministryLiscenceArray: req.files['ministryID'],
        syndicateLiscenceArray: req.files['syndicateID'],
        CVarray: req.files['CV']
    })

    if (!req.files['ministryID']) {
        console.log({
            user_API_message: "tour guide didn't send the minisrty liscence",
            ministryLiscenceArray: req.files['ministryID']
        })
        return next(new Error('ministry liscence must be sent', { cause: 400 }))
    } else if (!req.files['syndicateID']) {
        console.log({
            user_API_message: "tour guide didn't send the syndicate liscence",
            syndicateLiscenceArray: req.files['syndicateID']
        })
        return next(new Error('syndicate liscence must be sent', { cause: 400 }))
    }
    // else if (!req.files['CV']) {
    //     console.log({
    //         user_API_message: "tour guide didn't send the CV file",
    //         syndicateLiscenceArray: req.files['CV']
    //     })
    //     return next(new Error('the CV file must be sent', { cause: 400 }))
    // }

    const ministry_array = req.files['ministryID']
    console.log({
        message: "ministry array is found!",
        ministry_liscenceArray: ministry_array
    })

    const ministry_image = ministry_array[0]
    console.log({
        message: "ministry image is found!",
        ministry_liscence_image: ministry_image
    })

    const syndicate_array = req.files['syndicateID']
    console.log({
        message: "syndicate array is found!",
        syndicate_liscenceArray: syndicate_array
    })

    const syndicate_image = syndicate_array[0]
    console.log({
        message: "syndicate image is found!",
        syndicate_liscence_image: syndicate_image
    })

    // image verification model

    let AI_result2;
    const imageRecUrl = process.env.AI_IMAGE_REC_URL
    console.log(imageRecUrl);

    const formData1 = new FormData();
    formData1.append('file1', fs.createReadStream(path.resolve(`${process.env.LOCAL_TEMP_UPLOADS_PATH}/${req.syndicateFileName}`)))
    formData1.append('file2', fs.createReadStream(path.resolve(`${process.env.LOCAL_TEMP_UPLOADS_PATH}/${req.ministryFileName}`)))
    console.log({
        message: 'form data is created!',
        created_form_data: formData1
    });
    console.log({
        phase: "image verification request",
        status: "prepared and about to be sent"
    })

    try {
        const AI_response = await axios.post(imageRecUrl, formData1, {
            headers: formData1.getHeaders()
        })

        console.log({
            message: 'response came from the AI model!',
            response_status: AI_response.status,
            response: AI_response.data,
            response_type: typeof (AI_response.data)
        });

        AI_result2 = AI_response

    } catch (error) {
        console.log({
            message: 'failed to send the request to the AI model!',
            error_message: error.message,
            error: error,
        });

        return next(new Error('failed to send the request to the AI model', { cause: 400 }));
    }

    console.log({
        phase: "image recognition request",
        status: "successfully ended!",
        message: "Ai result is successful!",
        AI_result: AI_result2.data,
        verified: AI_result2.data.verified
    })

    if (!AI_result2.data.verified) {
        await deleteTempFiles()
        return next(new Error('images do not match', { cause: StatusCodes.BAD_REQUEST }))
    }

    console.log({
        phase: "OCR request",
        status: "preparing"
    })
    const OCR_url = process.env.AI_OCR_url

    let AI_result;

    console.log({
        message: "request temp file name check",
        tempFileName: req.syndicateFileName
    })

    const formData = new FormData();
    formData.append('image', fs.createReadStream(path.resolve(`${process.env.LOCAL_TEMP_UPLOADS_PATH}/${req.syndicateFileName}`)))
    // const languages_string = queryString.stringify({ languages: languages })
    console.log({
        stringified_languages: JSON.stringify(languages)
    })
    formData.append('languages', JSON.stringify(languages))
    console.log({
        message: 'form data is created!',
        created_form_data: formData
    });
    console.log({
        phase: "OCR request",
        status: "prepared and about to be sent"
    })

    try {
        const AI_response = await axios.post(OCR_url, formData, {
            headers: formData.getHeaders()
        })

        console.log({
            message: 'response came from the AI model!',
            response_status: AI_response.status,
            response: AI_response.data,
            response_type: typeof (AI_response.data)
        });

        AI_result = AI_response

    } catch (error) {
        console.log({
            message: 'failed to send the request to the AI model!',
            error_message: error.message,
            error: error,
        });
        await deleteTempFiles()
        return next(new Error('failed to send the request to the AI model', { cause: 400 }));
    }
    console.log({
        phase: "OCR request",
        status: "successfully ended!",
        message: "Ai result is successful!",
        AI_result: AI_result.data,
        returned_languages_length: AI_result.data.languages.length,
        returned_languages_length_type: typeof (AI_result.data.languages.length)
    })

    if (AI_result.data.languages.length === 0) {
        console.log({
            user_API_message: "liscence verification failed"
        })
        return next(new Error('your liscence verification failed!', { cause: 400 }))
    }

    console.log({
        message: "liscence verification is successfull!",
        verification: AI_result.data.languages
    })
    userData.languages = AI_result.data.languages


    userData.verified = true

    const customId = nanoid()
    userData.customId = customId

    let profilePic, ministryLiscencePic, syndicateLiscencePic, CVfile
    const profileUploadPath = `${process.env.PROJECT_UPLOADS_FOLDER}/tourGuides/${customId}/profile_picture`
    const ministryLiscenceUploadPath = `${process.env.PROJECT_UPLOADS_FOLDER}/tourGuides/${customId}/ministry_liscence`
    const syndicateLiscenceuploadPath = `${process.env.PROJECT_UPLOADS_FOLDER}/tourGuides/${customId}/syndicate_liscence`
    const CVuploadPath = `${process.env.PROJECT_UPLOADS_FOLDER}/tourGuides/${customId}/CV`

    req.profileImgPath = profileUploadPath
    req.ministryLiscenceImgPath = ministryLiscenceUploadPath
    req.syndicateLiscenceImgPath = syndicateLiscenceuploadPath
    req.CvfilePath = CVuploadPath

    // ministry liscence image uploading
    console.log({
        phase: "ministry liscence uploading!",
        state: "starting!"
    })
    try {
        ministryLiscencePic = await cloudinary.uploader.upload(ministry_image.path, {
            folder: ministryLiscenceUploadPath,
        })
        console.log({
            ministry_image_after_uploading: ministryLiscencePic
        })
    } catch (error) {
        console.log({
            message: "error regarding uploading a file",
            error: error
        })
    }
    if (!ministryLiscencePic?.secure_url || !ministryLiscencePic?.public_id) {
        console.log({ api_error_message: "failed to correctly upload the image" })
        return next(new Error('failed to upload the ministry liscence image correctly', { cause: 500 }))
    }
    userData.ministyliscence = {
        secure_url: ministryLiscencePic.secure_url,
        public_id: ministryLiscencePic.public_id
    }
    console.log({
        phase: "ministry liscence uploading!",
        state: "successfull!"
    })

    // syndicate liscence image uploading
    console.log({
        phase: "syndicate liscence uploading!",
        state: "starting!"
    })
    try {
        syndicateLiscencePic = await cloudinary.uploader.upload(syndicate_image.path, {
            folder: syndicateLiscenceuploadPath
        })
        console.log({
            syndicate_image_after_uploading: syndicateLiscencePic
        })
    } catch (error) {
        console.log({
            message: "error regarding uploading a file",
            error: error
        })
    }
    if (!syndicateLiscencePic?.secure_url || !syndicateLiscencePic?.public_id) {
        console.log({ api_error_message: "failed to correctly upload the image" })
        return next(new Error('failed to upload the syndicate liscence image correctly', { cause: 500 }))
    }
    userData.syndicateLiscence = {
        secure_url: syndicateLiscencePic.secure_url,
        public_id: syndicateLiscencePic.public_id
    }
    console.log({
        phase: "syndicate liscence uploading!",
        state: "successfull!"
    })

    let profile_array, profile_image
    if (req.files['profilePicture']) {
        profile_array = req.files['profilePicture']
        console.log({
            message: "profile array is found!",
            profilePicture_array: profile_array
        })

        profile_image = profile_array[0]
        console.log({
            message: "profile image is found!",
            profile_picture_image: profile_image
        })
        // profile image uploading
        console.log({
            phase: "profile picture uploading!",
            state: "starting!"
        })
        try {
            profilePic = await cloudinary.uploader.upload(profile_image.path, {
                folder: profileUploadPath
            })
            console.log({
                profile_image_after_uploading: profilePic
            })
        } catch (error) {
            console.log({
                message: "error regarding uploading a file",
                error: error
            })
        }
        if (!profilePic?.secure_url || !profilePic?.public_id) {
            console.log({ api_error_message: "failed to correctly upload the image" })
            return next(new Error('failed to upload the profile image correctly', { cause: 500 }))
        }
        userData.profilePicture = {
            secure_url: profilePic.secure_url,
            public_id: profilePic.public_id
        }
        console.log({
            phase: "profile picture uploading!",
            state: "successfull!"
        })
    }

    let CV_array, CV_file
    if (req.files['CV']) {
        CV_array = req.files['CV']
        console.log({
            message: "CV file array is found!",
            CVfile_Array: CV_array
        })

        CV_file = CV_array[0]
        console.log({
            message: "CV file is found!",
            CV_file: CV_file
        })
        // CV file uploading
        console.log({
            phase: "CV file uploading!",
            state: "starting!"
        })
        try {
            CVfile = await cloudinary.uploader.upload(CV_file.path, {
                folder: CVuploadPath
            })
            console.log({
                CVfile_after_uploading: CVfile
            })
        } catch (error) {
            console.log({
                message: "error regarding uploading a file",
                error: error
            })
        }
        if (!CVfile?.secure_url || !CVfile?.public_id) {
            console.log({ api_error_message: "failed to correctly upload the CV file" })
            return next(new Error('failed to upload the CV file correctly', { cause: 500 }))
        }
        userData.CV = {
            secure_url: CVfile.secure_url,
            public_id: CVfile.public_id
        }
        console.log({
            phase: "CV file uploading!",
            state: "successful!"
        })
    }

    // NOTE : we need to delete every saved image in the folder after we upload the files on cloudinary because we need the same path for cloudinary not only the AI request with axios
    await deleteTempFiles()

    const saveUser = await tourGuideModel.create(userData)
    if (!saveUser) {
        console.log({
            api_error_message: "couldn't save the tour guide!"
        })
        await cloudinary.uploader.destroy(profilePic?.public_id)
        await cloudinary.uploader.destroy(ministryLiscencePic?.public_id)
        await cloudinary.uploader.destroy(syndicateLiscencePic?.public_id)
        await cloudinary.uploader.destroy(CVfile?.public_id)

        console.log({
            api_message: "uploaded images are deleted!"
        })
        return next(new Error("couldn't save the tour guide!", { cause: 500 }))
    }
    console.log({
        message: "tour guide saved in data base!"
    })

    // const token = generateToken({
    //     expiresIn: '1d',
    //     signature: process.env.LOGIN_SECRET_KEY,
    //     payload: {
    //         email: saveUser.email,
    //         userName: saveUser.userName,
    //         role: systemRoles.tourGuide
    //     }
    // })
    // console.log({ message: "user token generated!" })

    // saveUser.token = token
    // saveUser.status = statuses.online
    // await saveUser.save()
    // console.log({ message: "user saved and is online!" })

    const confirmToken = generateToken({ payload: { email }, signature: process.env.CONFIRM_LINK_SECRETE_KEY, expiresIn: '1h' })
    console.log({ message: "account confirmation token generated!" })

    console.log(`req destination host:${req.headers.host}`)
    const confirmLink = `${req.protocol}://${req.headers.host}/${process.env.tourGuide_auth_confirm_account_endpoint}${confirmToken}`
    console.log({
        confirmation_API_link: confirmLink
    })

    const message = `<a href = ${confirmLink} >PLEASE USE THIS LINK TO CONFIRM YOUR EMAIL !</a>`
    const subject = 'Email confirmation'
    const sendEMail = emailService({ message, to: email, subject })
    if (!sendEMail) {
        console.log({
            api_error_message: "account confirmation email sending failure!"
        })
        return next(new Error('sending email failed!', { cause: 500 }))
    }

    console.log("\nTOUR GUIDE SIGN UP IS DONE!\n")
    res.status(StatusCodes.CREATED).json({
        message: "user added!"
    })
}

export const TG_confirmAccount = async (req, res, next) => {
    console.log("\nTOUR GUIDE CONFIRM ACCOUNT!\n")

    const { confirmToken } = req.params

    const decodeToken = verifyToken({ token: confirmToken, signature: process.env.CONFIRM_LINK_SECRETE_KEY })
    console.log({
        message: "confirmation token is decoded!",
        confirmation_token: decodeToken
    })
    if (!decodeToken) {
        console.log({
            api_error_message: "failed to decode the confirmation token"
        })
        return next(new Error('failed to decode the confirmation token!', { cause: 400 }))
    }

    const getUser = await tourGuideModel.findOne({ email: decodeToken?.email })
        .select("firstName lastName token email profilePicture")
    console.log({ user_fetching_errors: getUser?.errors })
    if (!getUser) {
        console.log({
            api_error_message: "failed to fetch the user!",
        })
        return next(new Error('failed to find user!', { cause: 500 }))
    }
    console.log({
        message: "user fetched!",
        fetched_user: getUser
    })

    if (getUser.confirmed === true) {
        console.log({
            message: "user is already confirmed!",
            is_user_confirmed: getUser.confirmed
        })
        return next(new Error('user is already confirmed!', { cause: 400 }))
    }

    getUser.confirmed = true
    console.log("user is confirmed!")

    getUser.save()
    console.log("user is saved!")

    console.log("\nTOUR GUIDE CONFRIM ACCOUNT IS DONE!\n")

    res.status(200).json({
        message: "confirmation done!"
    })
}

export const TG_login = async (req, res, next) => {
    console.log("\nTOUR GUIDE LOGIN API\n")

    const { email, password } = req.body

    const getUser = await tourGuideModel.findOne({ email })
    console.log({ user_fetching_errors: getUser?.errors })
    if (!getUser) {
        console.log({
            user_error_message: "login email is invalid!"
        })
        return next(new Error('invalid login credentials', { cause: 400 }))
    }
    console.log({
        message: "user is found!",
        user: getUser
    })

    const isPassMatch = bcrypt.compareSync(password, getUser.password)
    console.log({
        is_password_valid: isPassMatch
    })

    if (!isPassMatch) {
        console.log({
            user_error_message: "login password is invalid!"
        })
        return next(new Error('your email or password is wrong!', { cause: 400 }))
    }

    const token = generateToken({
        expiresIn: '1d',
        signature: process.env.LOGIN_SECRET_KEY,
        payload: {
            email: getUser.email,
            userName: getUser.userName,
            role: systemRoles.tourGuide
        }
    })

    if (!token) {
        console.log({
            api_error_message: "failed to generate user token!",
        })
        return next(new Error('failed to generate user token', { cause: 500 }))
    }
    console.log({
        message: "user token is generated!"
    })

    const updateUser = await tourGuideModel.findOneAndUpdate({ email }, { status: statuses.online, token }, { new: true })
        .select("firstName lastName token email confirmed -_id")
    console.log({ user_updating_errors: updateUser?.errors })
    if (!updateUser) {
        console.log({
            api_error_message: "failed to generate user token!",
        })
        return next(new Error('failed to login the user!', { cause: 500 }))
    }
    console.log({
        message: "user is now online!",
        logged_in_user: updateUser
    })

    console.log("\nTOUR GUIDE LOGIN IS DONE!\n")
    res.status(200).json({
        message: "login is successfull!",
        user: updateUser
    })
}

export const TG_forgetPassword = async (req, res, next) => {

    console.log("\n\TOUR GUIDE FORGET PASSWORD APIn")
    const { email } = req.body

    const getUser = await tourGuideModel.findOne({ email })
    console.log({ user_fetching_errors: getUser?.errors })
    if (!getUser) {
        console.log({
            api_error_message: 'No account found with provided credentials!'
        })
        return next(new Error("no account found with this email.", { cause: 400 }))
    }
    console.log({
        message: "user fetched!",
        fetched_user: getUser
    })

    const code = nanoid2()
    console.log("reset code generated!")
    const hashedCode = bcrypt.hashSync(code, +process.env.FORGET_PASSWORD_CODE_SALT)
    console.log("reset code hashed!")

    const token = generateToken({
        payload: {
            email,
            resetCode: hashedCode
        },
        signature: process.env.reset_password_secret_key,
        expiresIn: '300s'
    })
    if (!token) {
        console.log({
            api_error_message: "failed to generate password reset token!",
        })
        return next(new Error('Failed to create password reset token', { cause: 500 }))
    }
    console.log({
        message: "password reset token is generated!"
    })

    const resetEmail = emailService({
        to: email,
        subject: 'Reset password',
        message: ` <h1>use this code below to reset your password in you app</h1>
        <p>${code}</p>`
    })
    if (!resetEmail) {
        console.log({
            api_error_message: "failed to send the reset password email!"
        })
        return next(new Error('failed to send password reset email!', { cause: 400 }))
    }
    console.log({
        message: "reset email sent successfully",
        reset_email: resetEmail
    })

    const updateUser = await tourGuideModel.findOneAndUpdate({ email }, { resetCode: hashedCode, forgetPassword: true }, { new: true })
    console.log({ user_updating_errors: updateUser?.errors })
    if (!updateUser) {
        console.log({
            api_error_message: "failed to forget user password"
        })
        return next(new Error('failed to forget password!', { cause: 400 }))
    }
    console.log({
        message: "user password has been forgotten!"
    })

    console.log("\nTOUR GUIDE FORGET PASSWORD IS DONE!\n")
    res.status(200).json({
        message: "forget password is done!",
        token,
        resetCode: code
    })
}

export const TG_resetPassword = async (req, res, next) => {
    console.log("\nTOUR GUIDE PASSWORD RESET API\n")
    const { token } = req.params
    const { newPassword } = req.body

    let decodedToken
    try {
        decodedToken = verifyToken({
            token,
            signature: process.env.reset_password_secret_key
        })
    } catch (error) {
        console.log({
            api_error_message: "token decoding error",
            JWTerrorName: error.name,
            JWTerrorMessage: error.message
        })
        if (error.name === 'TokenExpiredError') {
            return next(new Error('reset code expired!', { cause: 408 }))
        }
    }
    if (!decodedToken) {
        console.log({
            api_error_message: "token decoding failure!"
        })
        return next(new Error("failed to decode the token", { cause: 400 }))
    }
    console.log({
        message: "token decoded!",
        decoded_token: decodedToken
    })

    const getUser = await tourGuideModel.findOne({
        email: decodedToken.email
    })
    console.log({ user_fetching_errors: getUser?.errors })
    if (!getUser) {
        console.log({
            api_error_message: "failed to find user!"
        })
        return next(new Error("user not found", { cause: 400 }))
    }
    if (decodedToken.resetCode !== getUser.resetCode) {
        console.log({
            api_error_message: "invalid reset code !"
        })
        return next(new Error('invalid reset code!', { cause: 400 }))
    }
    console.log({
        message: "user found!",
        user: getUser
    })

    const isPassMatch = await bcrypt.compare(newPassword, getUser.password)
    if (isPassMatch) {
        console.log({
            api_error_message: "the new password cannot be same as old one!",
            old_password: getUser.password,
            entered_new_password: newPassword
        })
        return next(new Error("The new password must be different from the current one.", { cause: 400 }))
    }
    console.log({
        message: "passwords match!",
        resetPasswordMatch: isPassMatch
    })

    const hashedNewPassword = bcrypt.hashSync(newPassword, +process.env.reset_password_salt)
    if (!hashedNewPassword) {
        console.log({
            api_error_message: 'Error hashing the new password!'
        })
        return next(new Error('failed to hash the new password!', { cause: 500 }))
    }
    getUser.password = hashedNewPassword
    console.log({
        message: "new password is added"
    })

    getUser.resetCode = null
    getUser.forgetPassword = false
    getUser.__v++
    console.log({
        message: "resetCode , forgetPassword are now back to default and version is incremented!"
    })

    if (!await getUser.save()) {
        console.log({
            api_error_message: "failed to save user changes!"
        })
        return next(new Error('failed to reset password', { cause: 500 }))
    }
    console.log({
        message: "user changes are saved!"
    })

    console.log("\nTOUR GUIDE PASSWORD RESET IS DONE!\n")
    res.status(200).json({
        message: "reset password done!"
    })
}

export const imageRecTest = async (req, res, next) => {
    console.log("controller active !")

    console.log({
        request_files: req.files,
        // img1: req.files['syndicateID'],
        // img2: req.files['ministryID']
    });

    // const httpClient = axios.create()
    // httpClient.defaults.timeout = 100000

    // console.log(path.resolve(path.join(process.env.LOCAL_TEMP_UPLOADS_PATH, req.syndicateFileName)))

    // console.log({
    //     phase: 'image recognition request',
    //     status: 'preparing'
    // })

    // const image1Path = path.resolve(process.env.LOCAL_TEMP_UPLOADS_PATH, req.syndicateFileName);
    // const image2Path = path.resolve(process.env.LOCAL_TEMP_UPLOADS_PATH, req.syndicateFileName);

    // const image1Buffer = fs.readFileSync(image1Path, 'base64url');
    // const image2Buffer = fs.readFileSync(image2Path, 'base64url');

    // const image1Base64 = image1Buffer.toString();
    // const image2Base64 = image2Buffer.toString();

    // const imgRecBody = {
    //     img1_path: `<img src='data:image/jpeg; base64,${image1Base64}'>`,
    //     img2_path: `<img src='data:image/jpeg; base64,${image2Base64}'>`
    // };

    // console.log({ image_rec_body_img1: imgRecBody.img1_path, image_rec_body_img2: imgRecBody.img2_path })

    // try {
    //     const AI_response = await httpClient.post(imageRecUrl, imgRecBody, {
    //         headers: {
    //             'Content-Type': 'application/json',
    //         }
    //     })

    //     console.log({
    //         message: 'response came from the AI model!',
    //         response_status: AI_response.status,
    //         response: AI_response.data,
    //         response_type: typeof (AI_response.data)
    //     });

    //     AI_result2 = AI_response

    // } catch (error) {
    //     console.log({
    //         message: 'failed to send the request to the AI model!',
    //         error_message: error.message,
    //         error: error.response.data,
    //         full_error: error
    //     });

    //     return next(new Error(`failed to send the request to the AI model , image1:${image1Base64}`, { cause: 400 }));
    // }

    // image verification model

    let AI_result2;
    const imageRecUrl = process.env.AI_IMAGE_REC_URL
    console.log(imageRecUrl);

    const formData1 = new FormData();
    formData1.append('file1', fs.createReadStream(path.resolve(`${process.env.LOCAL_TEMP_UPLOADS_PATH}/${req.syndicateFileName}`)))
    formData1.append('file2', fs.createReadStream(path.resolve(`${process.env.LOCAL_TEMP_UPLOADS_PATH}/${req.ministryFileName}`)))
    console.log({
        message: 'form data is created!',
        created_form_data: formData1
    });
    console.log({
        phase: "OCR request",
        status: "prepared and about to be sent"
    })

    try {
        const AI_response = await axios.post(imageRecUrl, formData1, {
            headers: formData1.getHeaders()
        })

        console.log({
            message: 'response came from the AI model!',
            response_status: AI_response.status,
            response: AI_response.data,
            response_type: typeof (AI_response.data)
        });

        AI_result2 = AI_response

    } catch (error) {
        console.log({
            message: 'failed to send the request to the AI model!',
            error_message: error.message,
            error: error,
        });

        return next(new Error('failed to send the request to the AI model', { cause: 400 }));
    }

    console.log({
        phase: "image recognition request",
        status: "successfully ended!",
        message: "Ai result is successful!",
        AI_result: AI_result2.data,
        verified: AI_result2.data.verified
    })

    if (!AI_result2.data.verified) {
        await deleteTempFiles()
        return next(new Error('images do not match', { cause: StatusCodes.BAD_REQUEST }))
    }

    await deleteTempFiles()

    res.status(200).json({
        message: "success !",
        AI_result: AI_result2.data
    })
}