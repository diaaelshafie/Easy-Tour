import {
    bcrypt, cloudinary, tourGuideModel, slugify, generateToken, verifyToken, customAlphabet, emailService,
    ReasonPhrases, StatusCodes, systemRoles, EGphoneCodes, languages, statuses, languagesCodes,
    countries, countriesCodes, axios, FormData, historicMP_Model
} from './controller.imports.js'

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

export const getUserInfo = async (req, res, next) => {
    console.log("\nAUTH GET USER INFO API\n")
    const { _id } = req.authUser

    let getUser

    getUser = getUser = await tourGuideModel.findById(_id)
        .select('firstName lastName email birthDate description phoneNumber languages address contact_info ministyliscence.secure_url syndicateLiscence.secure_url profilePicture.secure_url CV.secure_url status -_id')
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
        message: "user fetching is successful!",
        user: getUser
    })
}

export const TG_updateProfile = async (req, res, next) => {
    console.log("\nTOURGUIDE UPDATE PROFILE API\n")

    const { _id } = req.authUser
    const {
        firstName, lastName, address, birthDate, phoneNumber, description,
        contactInfo
    } = req.body

    // get the user
    const getUser = await tourGuideModel.findById(_id)
    if (!getUser) {
        console.log({
            user_error_message: "tour guide not found!"
        })
        return next(new Error("tour guide not found , invalid tour guide id!", { cause: 400 }))
    }
    if (getUser?.errors) {
        console.log({
            api_error_message: "failure in database query!",
            db_error_details: getUser?.errors
        })
        return next(new Error("failure in tour guide search!", { cause: 500 }))
    }
    console.log({
        message: "tour guide is found!",
        tourGuide: getUser
    })

    // update the user data
    if (firstName) {
        console.log({
            message: "firstname is found!",
            found_firstname: firstName
        })
        const sluggedFirstName = slugify(firstName, '_')
        getUser.firstName = firstName
        getUser.firsNameSlug = sluggedFirstName
        console.log({
            message: "first name updated"
        })
    }

    if (lastName) {
        console.log({
            message: "lastname is found!",
            found_lastname: lastName
        })
        const sluggedlastName = slugify(lastName, '_')
        getUser.lastName = lastName
        getUser.lastNameSlug = sluggedlastName
        console.log({
            message: "last name updated!"
        })
    }

    if (address) {
        console.log({
            message: "address is found!",
            found_address: address
        })
        getUser.address = address
        console.log({ message: "address updated!" })
    }

    if (birthDate) {
        console.log({
            message: "birth date is found!",
            found_birthdate: birthDate
        })
        getUser.birthDate = birthDate
        console.log({ message: "birth date updated!" })
    }

    if (phoneNumber) {
        console.log({
            message: "phone number is found!",
            found_phonenumber: phoneNumber,
            entered_length: phoneNumber.length
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

    if (description) {
        console.log({
            message: "description is found!",
            found_description: description
        })
        getUser.description = description
        console.log({ message: "description updated!" })
    }

    if (contactInfo) {
        console.log({
            message: "contact info is found!",
            contact_info: contactInfo
        })
        if (contactInfo.facebook) {
            console.log({
                message: "facebook contact is found!",
                found_facebook: contactInfo.facebook
            })
            getUser.contact_info.facebook = contactInfo.facebook
            console.log({ message: "facebook contact updated!" })
        }

        if (contactInfo.instagram) {
            console.log({
                message: "instagram contact is found!",
                found_instagram: contactInfo.instagram
            })
            getUser.contact_info.instagram = contactInfo.instagram
            console.log({ message: "instagram contact updated!" })
        }

        if (contactInfo.twitter) {
            console.log({
                message: "twitter contact is found!",
                found_twitter: contactInfo.twitter
            })
            getUser.contact_info.twitter = contactInfo.twitter
            console.log({ message: "twitter contact updated!" })
        }

        if (contactInfo.whatsapp) {
            console.log({
                message: "whatsapp contact is found!",
                found_whatsapp: contactInfo.whatsapp
            })
            getUser.contact_info.whatsapp = contactInfo.whatsapp // EDIT THE getUser whatsApp -> whatsApp
            console.log({ message: "whatsapp contact updated!" })
        }

        if (contactInfo.linkedIn) {
            console.log({
                message: "linkedIn contact is found!",
                found_linkedIn: contactInfo.linkedIn
            })
            getUser.contact_info.linkedIn = contactInfo.linkedIn
            console.log({ message: "linkedIn contact updated!" })
        }
    }


    if (req.files) {
        console.log({
            message: "files are found!",
            files: req.files,
            // profileArray: req.files['profilePicture'],
            // ministryArray: req.files['ministryID'],
            // syndicateArray: req.files['syndicateID'],
            // CVarray: req.files['CV']
        })

        let customId
        if (getUser.customId) {
            customId = getUser.customId
            console.log({ message: "user has uploaded images before", existing_customId: getUser.customId })
        } else {
            customId = nanoid()
            getUser.customId = customId
            console.log({
                message: "custom id is created!",
                created_customId: customId
            })
        }

        // TODO : edit  the image uploading part to allow the update of an existing image
        let newProfilePic, newSyndicatePic, newMinistryPic, newCVfile
        if (req.files['profilePicture']) {
            console.log({
                message: 'Profile picture found!',
                found_profilePic: req.files['profilePicture']
            })
            const profilePath = `${process.env.PROJECT_UPLOADS_FOLDER}/tourGuides/${customId}/profile_picture`
            const file = req.files['profilePicture'][0]
            console.log({
                document_profile_picture: getUser.profilePicture,
                document_profile_picture_id: getUser.profilePicture.public_id,
                type_of_the_picture_id: typeof (getUser.profilePicture?.public_id)
            })
            if (getUser.profilePicture && typeof (getUser.profilePicture.public_id) == 'string') {
                console.log({ message: "user has a profile picture and will be updated!" })
                // delete the previous picture first then upload the new one
                try {
                    const isFound = await cloudinary.api.resource(getUser.profilePicture?.public_id)
                    if (isFound !== null) {
                        console.log({ message: "resource is found!", found_asset: isFound })
                        await cloudinary.api.delete_resources_by_prefix(getUser.profilePicture?.public_id)
                        console.log({ message: "profile picture is deleted!" })
                    }
                    newProfilePic = await cloudinary.uploader.upload(file.path, { folder: profilePath })
                    console.log({ message: "new profile picture is uploaded!" })
                    getUser.profilePicture.secure_url = newProfilePic.secure_url
                    getUser.profilePicture.public_id = newProfilePic.public_id
                    console.log({ message: "profile picture is updated!" })
                } catch (error) {
                    console.log({ api_error_message: "failure in updating an existing profile picture", error: error })
                    return next(new Error("failure in updating an existing profile picture", { cause: 500 }))
                }
            } else {
                console.log({ message: "user has no profile picture and will be added one!" })
                try {
                    newProfilePic = await cloudinary.uploader.upload(file.path, { folder: profilePath })
                    console.log({ message: "new profile picture is uploaded!" })
                    getUser.profilePicture.secure_url = newProfilePic.secure_url
                    getUser.profilePicture.public_id = newProfilePic.public_id
                    console.log({ message: "profile picture is updated!" })
                } catch (error) {
                    console.log({ api_error_message: "failed to add the profile picture!", error: error })
                    return next(new Error("failed to add the profile picture!", { cause: 500 }))
                }
            }
        }

        // if (req.files['ministryID']) {
        //     console.log({
        //         message: 'Ministry image found!',
        //         found_ministry_image: req.files['ministryID']
        //     })
        //     const ministryPath = `${process.env.PROJECT_UPLOADS_FOLDER}/tourGuides/${customId}/ministry_liscence`
        //     const file = req.files['ministryID'][0]
        //     console.log({ message: "user has a ministry image and will be updated!" })
        //     try {
        //         const isFound = await cloudinary.api.resource(getUser.ministyliscence.public_id)
        //         if(isFound!==null) {
        //         console.log({ message: "resource is found!" , found_asset:isFound })
        //         await cloudinary.api.delete_resources_by_prefix(getUser.ministyliscence.public_id)
        //         console.log({ message: "ministry image is deleted!" })
        //         }
        //         newMinistryPic = await cloudinary.uploader.upload(file.path, { folder: ministryPath })
        //         console.log({ message: "new ministry image is uploaded!" })
        //         getUser.ministyliscence.secure_url = newMinistryPic.secure_url
        //         getUser.ministyliscence.public_id = newMinistryPic.public_id
        //         console.log({ message: "ministry image is updated" })
        //     } catch (error) {
        //         console.log({ api_error_message: "failure in updating the existing ministry picture", error: error })
        //         return next(new Error("failure in updating the existing ministry picture", { cause: 500 }))
        //     }
        // }

        // if (req.files['syndicateID']) {
        //     // TODO : add the OCR before the uploading of the new syndicate image
        //     console.log({
        //         message: 'Syndicate image found!',
        //         found_syndicate_image: req.files['syndicateID']
        //     })
        //     const file = req.files["syndicateID"][0]
        //     const syndicatePath = `${process.env.PROJECT_UPLOADS_FOLDER}/tourGuides/${customId}/syndicate_liscence`
        //     try {
        //         const isFound = await cloudinary.api.resource(getUser.syndicateLiscence.public_id)
        //         if(isFound!==null) {
        //         console.log({ message: "resource is found!" , found_asset:isFound })
        //         await cloudinary.api.delete_resources_by_prefix(getUser.syndicateLiscence.public_id)
        //         console.log({ message: "syndicate image is deleted!" })
        //         }
        //         newSyndicatePic = await cloudinary.uploader.upload(file.path, { folder: syndicatePath })
        //         console.log({ message: "new ministry image is uploaded!" })
        //         getUser.syndicateLiscence.secure_url = newSyndicatePic.secure_url
        //         getUser.syndicateLiscence.public_id = newSyndicatePic.public_id
        //         console.log({ message: "syndicate image is updated!" })
        //     } catch (error) {
        //         console.log({ api_error_message: "failure in updating the existing syndicate picture", error: error })
        //         return next(new Error("failure in updating the existing syndicate picture", { cause: 500 }))
        //     }
        // }

        // TODO : edit  the image uploading part to allow the update of an existing image
        if (req.files['CV']) {
            console.log({
                message: "CV file is found!",
                found_CV_file: req.files['CV']
            })
            const file = req.files['CV'][0]
            const CVpath = `${process.env.PROJECT_UPLOADS_FOLDER}/tourGuides/${customId}/CV`
            console.log({
                document_CV: getUser.CV,
                document_CV_id: getUser.CV?.public_id,
                type_of_the_CV_id: typeof (getUser.CV?.public_id)
            })
            if (getUser.CV && typeof (getUser.CV.public_id) == 'string') {
                console.log({ message: "user has a CV file and will be updated!" })
                try {
                    const isFound = await cloudinary.api.resource(getUser.CV.public_id)
                    if (isFound !== null) {
                        console.log({ message: "resource is found!", found_asset: isFound })
                        await cloudinary.api.delete_resources_by_prefix(getUser.CV.public_id)
                        console.log({ message: "CV file is deleted!" })
                    }
                    newCVfile = await cloudinary.uploader.upload(file.path, { folder: CVpath })
                    console.log({ message: "new CV file is uploaded!" })
                    getUser.CV.secure_url = newCVfile.secure_url
                    getUser.CV.public_id = newCVfile.public_id
                    console.log({ message: "CV file is uploaded!" })
                } catch (error) {
                    console.log({ api_error_message: "failure in updating the existing CV file", error: error })
                    return next(new Error("failure in updating the existing CV file", { cause: 500 }))
                }
            } else {
                console.log({ message: "user has no CV file and will be added one!" })
                try {
                    newCVfile = await cloudinary.uploader.upload(file.path, { folder: CVpath })
                    console.log({ message: "new CV file is uploaded!" })
                    getUser.CV.secure_url = newCVfile.secure_url
                    getUser.CV.public_id = newCVfile.public_id
                    console.log({ message: "CV file updated!" })
                } catch (error) {
                    console.log({ api_error_message: "failure in updating the existing CV file", error: error })
                    return next(new Error("failure in updating the existing CV file", { cause: 500 }))
                }
            }
        }
        newCVfile = null; newMinistryPic = null; newProfilePic = null; newSyndicatePic = null;
    }

    try {
        await getUser.save()
        console.log({ message: "user updates are saved!" })
    } catch (error) {
        console.log({ message: "failed to save the user updates" })
    }

    const responseData = {
        firstName: getUser.firstName,
        lastName: getUser.lastName,
        address: getUser.address,
        birthData: getUser.birthDate,
        description: getUser.description,
        phoneNumber: getUser.phoneNumber,
        contact_info: getUser.contact_info,
        languages: getUser.languages,
        status: getUser.status,
        token: getUser.token,
        profilePicture: {
            secure_url: getUser.profilePicture?.secure_url
        },
        ministryLiscence: {
            secure_url: getUser.ministyliscence?.secure_url
        },
        syndicateLiscence: {
            secure_url: getUser.syndicateLiscence?.secure_url
        },
        CV: {
            secure_url: getUser.CV?.secure_url
        }
    }
    console.log("\nTOURGUIDE API DONE!\n")
    res.status(200).json({
        message: "user updated successfully!",
        updated_user: responseData
    })

}