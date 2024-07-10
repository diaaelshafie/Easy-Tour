import {
    bcrypt, cloudinary, touristModel, slugify, generateToken, verifyToken, customAlphabet, emailService,
    ReasonPhrases, StatusCodes, systemRoles, EGphoneCodes, languages, statuses, languagesCodes,
    countries, countriesCodes, axios, FormData, historicMP_Model, deleteAsset, deleteFolder,
    restoreAsset, restoreAssetPromise, tourGuideModel, deleteAssociatedTrips
} from './controller.imports.js'

export const confrirmOldPass = async (req, res, next) => {
    console.log("\nAUTH CONFIRM OLD PASS API\n")
    const { _id } = req.authUser
    const { oldPassword } = req.body

    if (!oldPassword) {
        console.log({
            user_error_message: "password is missing",
            entered_password: oldPassword,
            purpose: "confirm current password!"
        })
        return next(new Error('old password must be entered!', { cause: 400 }))
    }
    console.log({ message: "password is found!" })

    let getUser
    getUser = getUser = await tourGuideModel.findById(_id)
    if (!getUser) {
        console.log({ api_error_message: "user id not found!" })
        return next(new Error('user not found!', { cause: 400 }))
    }
    console.log({
        message: "user is found!",
        user_found: getUser
    })

    // this line will fail if the stored password in the data base is not hashed because bcrypt will hash it anyways then compare it
    const isPassMatch = bcrypt.compareSync(oldPassword, getUser.password)
    console.log({ is_password_valid: isPassMatch })
    if (!isPassMatch) {
        console.log({ user_error_message: "user entered incorrect password!" })
        return next(new Error("incorrect password!", { cause: 400 }))
    }
    console.log({ message: "the entered password is correct!" })

    console.log("\nAUTH CONFIRM OLD PASS IS DONE!\n")
    res.status(200).json({
        message: "you can continue to change your password!"
    })
}

export const changeOldPass = async (req, res, next) => {
    console.log("\nAUTH CHANGE PASSWORD API\n")
    const { _id } = req.authUser
    const { newPassword, confirmNewPassword } = req.body

    if (!newPassword) {
        console.log({ user_error_message: "new password is missing!" })
        return next(new Error('you must enter the new Password!', { cause: 400 }))
    }
    console.log({ message: "new password is found!" })
    if (!confirmNewPassword) {
        console.log({ user_error_message: "confirm new password is missing!" })
        return next(new Error('you must confirm the new Password!', { cause: 400 }))
    }
    console.log({ message: "confirm new password is found!" })

    if (newPassword !== confirmNewPassword) {
        console.log({
            user_error_message: "the user entered 2 non-matching passwords",
            entered_new_password: newPassword,
            entered_confirm_new_password: confirmNewPassword
        })
        return next(new Error('passwords must match!', { cause: 400 }))
    }
    console.log({ message: "the 2 entered passwords matched!" })

    const getUser = await tourGuideModel.findById(_id)
    if (!getUser) {
        console.log({ api_error_message: "user id not found!" })
        return next(new Error('user not found!', { cause: 400 }))
    }
    console.log({
        message: "user is found!",
        user_found: getUser
    })

    const isPassMatch = bcrypt.compareSync(newPassword, getUser.password)
    console.log({ is_new_pass_matches_old: isPassMatch })
    if (isPassMatch) {
        console.log({ user_error_message: "user entered the same password as the old one!" })
        return next(new Error('you must enter a new Password!', { cause: 400 }))
    }
    console.log({ message: "the new password doesn't match the old one!" })

    const newHashedPassword = bcrypt.hashSync(newPassword, +process.env.SIGN_UP_SALT_ROUNDS)
    getUser.password = newHashedPassword
    console.log({ message: "new password is updated!" })

    if (!await getUser.save()) {
        console.log({ api_error_message: "failed to update the new password!" })
        return next(new Error('failed to save new password!', { cause: 500 }))
    }
    getUser.__v++
    console.log({ message: "user password is changed!" })

    console.log("\nAUTH CHANGE PASSWORD IS DONE!\n")
    res.status(200).json({
        message: "changing password is successfull!"
    })
}

export const new_deleteUser = async (req, res, next) => {
    console.log("\nAUTH DELETE USER API\n")

    const getUser = req.authUser

    console.log({
        passed_auth_user: getUser
    })

    // perparing variables :
    // user custom id :
    const customId = getUser.customId

    let profilePath = `${process.env.PROJECT_UPLOADS_FOLDER}/${getUser.role}s/${customId}/profilePicture`
    let ministryPath = `${process.env.PROJECT_UPLOADS_FOLDER}/tourGuides/${customId}/ministry_liscence`
    let syndicatepath = `${process.env.PROJECT_UPLOADS_FOLDER}/tourGuides/${customId}/syndicate_liscence`
    let CVpath = `${process.env.PROJECT_UPLOADS_FOLDER}/tourGuides/${customId}/CV`

    // user folder path : 
    let userFolderPath = `${process.env.PROJECT_UPLOADS_FOLDER}/${getUser.role}s/${customId}`

    let ministryPublicId = getUser.ministyliscence?.public_id // may get an error !
    let syndicatePubliceId = getUser.syndicateLiscence?.public_id // may get an error !
    let CVpublicId = getUser.CV?.public_id // may get an error !
    let profilePublicId = getUser.profilePicture?.public_id

    let error_messages = []
    console.log({
        user_profile_picture: getUser.profilePicture,
        public_id_type: typeof (getUser.profilePicture?.public_id)
    })

    // profile image deleting
    if (getUser.profilePicture && typeof (getUser.profilePicture?.public_id) === 'string') {
        console.log({ message: "user had a profile image and will be deleted!" })
        try {
            await cloudinary.uploader.destroy(getUser.profilePicture?.public_id)
            console.log({ message: "user profile picture is deleted" })
        } catch (error) {
            error_messages.push("failed to delete the user profile image")
            console.log({ message: "failed to delete the user profile image", error })
        }
        // this is commented as it makes errors and an empty folder having an empty folder can be deleted
        // try {
        //     await cloudinary.api.delete_folder(profilePath)
        //     log({ message: "user picture folder is delted!" })
        // } catch (error) {
        //     error_messages.push("failed to delete the user profile folder")
        //     console.log({ message: "failed to delete the user profile folder", error })
        // }
    } else console.log({ message: "user had no profile image!" })

    // syndicate image deleting
    if (getUser.syndicateLiscence && typeof (getUser.syndicateLiscence?.public_id) === 'string') {
        console.log({ message: "user had a syndicate image and will be deleted!" })
        try {
            await cloudinary.uploader.destroy(getUser.syndicateLiscence?.public_id)
            console.log({ message: "user syndicate image is deleted!" })
        } catch (error) {
            error_messages.push("failed to delete the user syndicate image")
            console.log({ message: "failed to delete the user syndicate image", error })
        }
        try {
            await cloudinary.api.delete_folder(syndicatepath)
            console.log({ message: "user syndicate folder is delted!" })
        } catch (error) {
            error_messages.push("failed to delete the syndicate folder")
            console.log({ message: "failed to delete the syndicate folder", error })
        }
    } else console.log({ message: "user had no syndicate image!" })

    // liscence image deleting
    if (getUser.ministyliscence && typeof (getUser.ministyliscence?.public_id) === 'string') {
        console.log({ message: "user had a ministry image and will be deleted!" })
        try {
            await cloudinary.uploader.destroy(getUser.ministyliscence?.public_id)
            console.log({ message: "user ministry image is deleted!" })
        } catch (error) {
            error_messages.push("failed to delete the user ministry image")
            console.log({ message: "failed to delete the user ministry image", error })
        }
        try {
            await cloudinary.api.delete_folder(ministryPath)
            console.log({ message: "user ministry folder is deleted!" })
        } catch (error) {
            error_messages.push("failed to delete the ministry folder")
            console.log({ message: "failed to delete the ministry folder", error })
        }
    } else console.log({ message: "user had no ministry image!" })

    // CV file deleting
    if (getUser.CV && typeof (getUser.CV?.public_id) === 'string') {
        console.log({ message: "user had a CV file and will be deleted!" })
        try {
            await cloudinary.uploader.destroy(getUser.CV?.public_id)
            console.log({ message: "user CV file is deleted!" })
        } catch (error) {
            error_messages.push("failed to delete the user CV file")
            console.log({ message: "failed to delete the user CV file", error })
        }
        try {
            await cloudinary.api.delete_folder(CVpath)
            console.log({ message: "user CV folder is deleted!" })
        } catch (error) {
            error_messages.push("failed to delete the CV folder")
            console.log({ message: "failed to delete the CV folder", error })
        }
    } else console.log({ message: "user had no CV" })

    console.log({ message: "user assets are deleted successfully" })

    // user folder deleting
    await deleteFolder(userFolderPath)

    // TODO : delete associated trips first and their days first
    if (getUser.createdTrips.length !== 0) {
        const deletedTrips = await deleteAssociatedTrips(getUser._id)
        if (deletedTrips.query_errors.length) {
            console.log({
                message: "failed to delete the assoicated trips",
                errors: deletedTrips.query_errors
            })
            return next(new Error("failed to delete the associated trips!", { cause: StatusCodes.INTERNAL_SERVER_ERROR }))
        }
        console.log({
            message: "tourGuide trips are deleted successfully!"
        })
    }
    const deletedUser = await tourGuideModel.findOneAndDelete({ _id: getUser.id }, { new: true })
    if (!deletedUser) {
        console.log({
            api_error_message: "failed to delete the user from the data base!"
        })
        // restoring all assets again
        const restoringPublicIDs = [profilePublicId, syndicatePubliceId, ministryPublicId, CVpublicId]
        const restoringPaths = [profilePath, syndicatepath, ministryPath, CVpath]
        let i = 0
        try {
            const assetsRestoring = await Promise.all(restoringPublicIDs.map(async (public_id) => {
                await restoreAssetPromise(public_id, restoringPaths[i])
                i++
            }))
            console.log({
                message: "user assets are restored successfully!"
            })
        } catch (error) {
            console.log({
                api_error_message: "An error occurred while trying to restore the user's assets",
                error: error
            })
        }
        return next(new Error("failed to delete the user !", { cause: 500 }))
    }

    console.log({
        message: "user is deleted successfully",
        deletedUser: deletedUser
    })
    // emptying the variables
    profilePublicId = null; CVpublicId = null; syndicatePubliceId = null
    ministryPublicId = null; userFolderPath = null; CVpath = null; syndicatepath = null;
    ministryPath = null; profilePath = null

    console.log("\nAUTH DELETE USER DONE!\n")
    res.status(200).json({
        message: `user is deleted successfully! , cloudinary errors : ${error_messages}`
    })
}

export const deleteAssocTrips_test = async (req, res, next) => {
    const deletedTrips = await deleteAssociatedTrips(getUser._id)
    if (deletedTrips.query_errors.length) {
        console.log({
            message: "failed to delete the assoicated trips",
            errors: deletedTrips.query_errors
        })
        return next(new Error("failed to delete the associated trips!", { cause: StatusCodes.INTERNAL_SERVER_ERROR }))
    }
    return res.status(StatusCodes.OK).json({
        message: "tourGuide trips are deleted successfully!"
    })
}
