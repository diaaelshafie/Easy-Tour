import {
    bcrypt, cloudinary, touristModel, slugify, generateToken, verifyToken, customAlphabet, emailService,
    ReasonPhrases, StatusCodes, systemRoles, EGphoneCodes, languages, statuses,
    languagesCodes, countries, countriesCodes, axios, historicMP_Model
} from './controller.imports.js'
// for tourist sign up :
const nanoid = customAlphabet('asdfghjkl123456789_#$%!', 5)
// for password reset :
const nanoid2 = customAlphabet('1234567890', 6)

// TODO : remove the role checking part
export const logOut = async (req, res, next) => {
    console.log("\nAUTH LOGOUT API\n")
    const { _id } = req.authUser

    let getUser
    if (req.userRole === systemRoles.tourist) {
        getUser = await touristModel.findById(_id)
        if (!getUser) {
            console.log({ api_error_message: "user id not found!" })
            return next(new Error('user not found!', { cause: 400 }))
        }
        console.log({
            message: "user is found!",
            user_found: getUser
        })
    } else if (req.userRole === systemRoles.tourGuide) {
        getUser = await tourGuideModel.findById(_id)
        if (!getUser) {
            console.log({ api_error_message: "user id not found!" })
            return next(new Error('user not found!', { cause: 400 }))
        }
        console.log({
            message: "user is found!",
            user_found: getUser
        })
    }

    getUser.token = null
    getUser.status = statuses.offline
    console.log({ message: "user is now offline!" })

    // TODO : edit ti try, catch
    if (!await getUser.save()) {
        console.log({ api_error_message: "failed to logout the user" })
        return next(new Error('failed to logout the user!', { cause: 400 }))
    }
    console.log({ message: "user is logged out!" })

    console.log("\nAUTH LOGOUT IS DONE!\n")
    res.status(200).json({
        message: "logout is successfull!"
    })
}

// TODO : remove the role checking part
export const getUserInfo = async (req, res, next) => {
    console.log("\nAUTH GET USER INFO API\n")
    const { _id } = req.authUser

    let getUser

    getUser = await touristModel.findById(_id)
        .select(
            '-_id userName gender age phoneNumber language status confirmed country countryFlag preferences profilePicture.secure_url coverPicture.secure_url'
        )
    if (!getUser) {
        console.log({ api_error_message: "user id not found!" })
        return next(new Error('user not found!', { cause: 400 }))
    }
    console.log({
        message: "user is found!",
        user_found: getUser
    })

    console.log("\nAUTH GET USER INFO IS DONE!\n")
    res.status(200).json({
        message: "user fetching is successfull!",
        user: getUser
    })
}

export const getAllFavPlaces = async (req, res, next) => {
    console.log("\nTOURIST GET ALL FAVOURITE PLACES API\n")

    const { _id } = req.authUser

    const getUser = await touristModel.findById(_id)
        .select('favouriteHistoricPlaces favouriteEntertainmentPlaces -_id')
        .populate([
            {
                path: 'favouriteHistoricPlaces',
                select: 'image.secure_url location name type'
            },
            {
                path: 'favouriteEntertainmentPlaces',
                select: 'image.secure_url location name type'
            }
        ])
        .exec()
    if (!getUser) {
        console.log({ user_error_message: "user is not found!" })
        return next(new Error("user is not found!", { cause: StatusCodes.BAD_REQUEST }))
    }
    if (getUser.errors) {
        console.log({ api_error_message: "error finding the user!" })
        return next(new Error("error finding the user!", { cause: StatusCodes.INTERNAL_SERVER_ERROR }))
    }
    console.log({
        message: "user is found!",
        user: getUser
    })

    console.log("\nTOURIST GET ALL FAVOURITE PLACES API DONE!\n")
    res.status(StatusCodes.OK).json({
        message: "favourite places are found!",
        user_favouritePlaces: getUser
    })
}

export const profileSetUp = async (req, res, next) => {

    console.log("\nTOURIST PROFILE UPDATE/SETUP API\n")
    console.log({
        body: req.body,
        files: req.files
    })
    const _id = req?.authUser._id
    const { phoneNumber, gender, age, language, country, preferences, countryFlag } = req.body // front -> not in DB document

    const getUser = await touristModel.findById(_id)
    if (!getUser) {
        console.log({
            api_error_message: "failed to fetch the user!",
        })
        return next(new Error("couldn't find user , invalid userID", { cause: 400 }))
    }
    console.log({
        message: "user found!",
        user_found: getUser
    })

    if (phoneNumber) {
        console.log({
            message: "phone number found in request!",
            phone_number: phoneNumber,
            phone_number_length: phoneNumber.length,
        })
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
        getUser.phoneNumber = phoneNumber
        console.log({ message: "phone number updated!" })
    }

    if (gender) {
        console.log({
            message: "gender found in request!",
            entered_gender: gender
        })
        if (gender !== 'male' && gender !== 'female' && gender !== 'not specified') {
            console.log({
                user_error_message: "user entered an invalid gender",
                available_genders: "male || female || not specified",
                entered_gender: gender
            })
            return next(new Error('invalid gender!', { cause: 400 }))
        }
        getUser.gender = gender
        console.log({ message: "gender is updated!" })
    }

    if (country) {
        console.log({
            message: "country found in request!",
            country_entered: country
        })
        getUser.country = country
        console.log({ message: "country is updated!" })
    }

    if (age) {
        console.log({
            message: "age found in request!",
            enetered_age: age
        })
        getUser.age = age
        console.log({ message: "age updated!" })
    }

    if (language) {
        console.log({
            message: "language found in request!",
            enetered_language: language
        })
        getUser.language = language
        console.log({ message: "language updated!" })
    }

    if (preferences) {
        console.log({
            message: "preferences are found in request!",
            enetered_preferences: preferences
        })
        getUser.preferences = preferences
        console.log({ message: "preferences updated!" })
    }

    if (countryFlag) {
        console.log({
            message: "country flage found in request!",
            enetered_countryFlag: countryFlag
        })
        getUser.countryFlag = countryFlag
        console.log({ message: "country flag is updated!" })
    }

    let profilePic, coverPic
    let profileUploadPath // for profile Picture
    let coverUploadPath // for cover picture
    if (req.files) {
        console.log({
            message: "files are found in request!",
            files: req.files,
            profileArray: req.files['profilePicture'],
            coverArray: req.files['coverPicture']
        })
        // we can either make a new customId for the usesd document or not , it may be better for security
        let customId
        let flag = false
        if (getUser.customId) { // if you have a custom id then you surely have uploaded images before
            console.log({
                message: "user has a custom id and maybe has uploaded an image before",
                existing_customId: getUser.customId
            })
            customId = getUser.customId
        }
        else { // else meanse that you don't have
            customId = nanoid()
            getUser.customId = customId
            console.log({
                message: "user didn't have a custom id and maybe didn't upload an image before",
                created_customId: customId
            })
            flag = true
        }
        profileUploadPath = `${process.env.PROJECT_UPLOADS_FOLDER}/tourists/${customId}/profilePicture`
        coverUploadPath = `${process.env.PROJECT_UPLOADS_FOLDER}/tourists/${customId}/coverPicture`
        for (const array in req.files) { // this gets the names of the arrays not the arrays them selves
            console.log({
                message: `the "${array}" array is accessed!`,
                iteration_array_name: array,
                type_of_iteration_array: typeof (array),
                iteration_array: req.files[array]
            })
            const arrayFields = req.files[array] // this should access the first array of req.files
            for (const file of arrayFields) { // each object of the array inside the object
                if (file.fieldname === 'profilePicture') {
                    console.log({
                        profile_picture_accessed: true,
                        accessed_file: file
                    })
                    let isFileExists
                    try {
                        isFileExists = await cloudinary.api.resource(getUser.profilePicture?.public_id)
                    } catch (error) {
                        console.log({
                            message: "file isn't found!",
                            error: error
                        })
                    }
                    if (isFileExists) { // if there is a file
                        console.log({
                            existing_file_to_be_deleted: isFileExists
                        })
                        await cloudinary.api.delete_resources_by_prefix(profileUploadPath)
                            .then(() => console.log({ message: "profile picture deleted!", profilePicDeleted: true }))
                            .catch(async (err) => {
                                console.log({
                                    message: "failed to delete profile picture",
                                    error: err
                                })
                            })
                        await cloudinary.api.delete_folder(profileUploadPath)
                            .then(() => console.log({ message: "profile picture folder deleted!" }))
                            .catch(async (err) => {
                                console.log({
                                    message: "failed to delete profile picture folder!",
                                    error: err
                                })
                            })
                    }
                    const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, {
                        folder: profileUploadPath
                    })
                    if (!secure_url || !public_id) {
                        console.log({ message: "failed to upload the profile picture!" })
                        return next(new Error("couldn't upload the profile picture!", { cause: 400 }))
                    }
                    console.log({ message: "profile picture uploaded!" })
                    profilePic = { secure_url, public_id }
                    getUser.profilePicture = profilePic
                    console.log({ message: "profile picture is updated!" })
                } else if (file.fieldname === 'coverPicture') {
                    console.log({
                        cover_picture_accessed: true,
                        accessed_file: file
                    })
                    let isFileExists
                    try {
                        isFileExists = await cloudinary.api.resource(getUser.coverPicture?.public_id)
                    } catch (error) {
                        console.log({
                            message: "file isn't found!",
                            error: error
                        })
                    }
                    if (isFileExists) { // if there is a file
                        console.log({
                            existing_file_to_be_deleted: isFileExists
                        })
                        await cloudinary.api.delete_resources_by_prefix(coverUploadPath)
                            .then(() => console.log({ message: "cover picture deleted!", coverPicDeleted: true }))
                            .catch(async (err) => {
                                console.log({
                                    message: "failed to delete cover picture",
                                    error: err
                                })
                            })
                        await cloudinary.api.delete_folder(coverUploadPath)
                            .then(() => console.log({ message: "cover picture folder deleted!" }))
                            .catch(async (err) => {
                                console.log({
                                    message: "failed to delete cover picture folder!",
                                    error: err
                                })
                            })
                    }
                    const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, {
                        folder: coverUploadPath
                    })
                    if (!secure_url || !public_id) {
                        console.log({ message: "failed to upload the cover picture!" })
                        return next(new Error("couldn't upload the cover picture!", { cause: 400 }))
                    }
                    console.log({ message: "cover picture uploaded!" })
                    coverPic = { secure_url, public_id }
                    getUser.coverPicture = coverPic
                    console.log({ message: "cover picture is updated!" })
                } else {
                    console.log({ user_error_message: "user enetered invalid field name!" })
                    return next(new Error('invalid file field name!', { cause: 400 }))
                }
            }
        }
    }
    profilePic = null
    coverPic = null
    profileUploadPath = null
    coverUploadPath = null


    req.profileImgPath = profileUploadPath
    req.coverImgPath = coverUploadPath


    if (!await getUser.save()) {
        console.log({ api_error_message: "failed to save user updates!" })
        return next(new Error("couldn't update the user in database!", { cause: 500 }))
    }
    console.log({ message: "user updates saved!" })
    getUser.__v++

    const responseData = {
        userName: getUser.userName,
        phoneNumber: getUser.phoneNumber,
        gender: getUser.gender,
        language: getUser.language,
        status: getUser.status,
        age: getUser.age,
        preferences: getUser.preferences,
        country: getUser.country,
        countryFlag: getUser.countryFlag,
        token: getUser.token,
        profilePicture: {
            secure_url: getUser.profilePicture?.secure_url
        },
        coverPicture: {
            secure_url: getUser.coverPicture?.secure_url
        }
    }
    console.log("\nTOURIST PROFILE SETUP/UPDATE DONE!\n")
    res.status(200).json({
        message: "your profile updating is completed!",
        user: responseData
    })
}