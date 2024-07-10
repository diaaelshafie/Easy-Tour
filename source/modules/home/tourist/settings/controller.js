import {
    bcrypt, cloudinary, touristModel, slugify, generateToken, verifyToken, customAlphabet, emailService,
    ReasonPhrases, StatusCodes, systemRoles, EGphoneCodes, languages, statuses, languagesCodes,
    countries, countriesCodes, axios, FormData, historicMP_Model, deleteAsset, deleteFolder,
    restoreAsset, restoreAssetPromise, AItripModel
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
        getUser = getUser = await tourGuideModel.findById(_id)
        if (!getUser) {
            console.log({ api_error_message: "user id not found!" })
            return next(new Error('user not found!', { cause: 400 }))
        }
        console.log({
            message: "user is found!",
            user_found: getUser
        })
    }

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
        getUser = getUser = await tourGuideModel.findById(_id)
        if (!getUser) {
            console.log({ api_error_message: "user id not found!" })
            return next(new Error('user not found!', { cause: 400 }))
        }
        console.log({
            message: "user is found!",
            user_found: getUser
        })
    }

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
    let coverPath = `${process.env.PROJECT_UPLOADS_FOLDER}/tourists/${customId}/coverPicture`
    // user folder path : 
    let userFolderPath = `${process.env.PROJECT_UPLOADS_FOLDER}/${getUser.role}s/${customId}`

    let profilePublicId = getUser.profilePicture?.public_id
    let coverPictureId = getUser.coverPicture?.public_id

    let error_messages = []
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

    // cover image deleting
    if (getUser.coverPicture && typeof (getUser.coverPicture?.public_id) === 'string') {
        console.log({ message: "user had a cover image and will be deleted!" })
        try {
            await cloudinary.uploader.destroy(getUser.coverPicture?.public_id)
            console.log({ message: "user cover picture is deleted" })
        } catch (error) {
            error_messages.push("failed to delete the user cover image")
            console.log({ message: "failed to delete the user cover image", error })
        }
        // this is commented as it makes errors and an empty folder having an empty folder can be deleted
        // try {
        //     await cloudinary.api.delete_folder(coverPath)
        //     log({ message: "user picture folder is delted!" })
        // } catch (error) {
        //     error_messages.push("failed to delete the user cover folder")
        //     console.log({ message: "failed to delete the user cover folder", error })
        // }
    } else console.log({ message: "user had no cover image!" })

    console.log({ message: "user assets are deleted successfully" })

    // user folder deleting
    await deleteFolder(userFolderPath)

    // DELETE THE AI trips of the tourist
    const deleteAItrips = await AItripModel.deleteMany({ touristId: getUser._id })
    if (!deleteAItrips.acknowledged) {
        console.log({ query_error_message: "couldn't delete the associated tourist trips!", deleteAItrips })
        // the below line is commented as untill now it shouldn't throw an error
        // return next(new Error(`failed to perform the query , return data : ${deleteAItrips}`,{cause:StatusCodes.INTERNAL_SERVER_ERROR}))
    }
    if (deleteAItrips.deletedCount == 0) {
        console.log({ info_message: 'there were no ai trips for this user!' })
    }

    // note : getUser.id was used instead of getUser._id in the below line , i don't prefer that
    const deletedUser = await touristModel.findByIdAndDelete(getUser._id, { new: true })
    if (!deletedUser) {
        console.log({
            api_error_message: "failed to delete the user from the data base!"
        })
        // restoring all assets again
        const restoringPublicIDs = [profilePublicId, coverPictureId]
        const restoringPaths = [profilePath, coverPath]
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
    coverPictureId = null; profilePublicId = null;
    userFolderPath = null;
    coverPath = null; profilePath = null

    console.log("\nAUTH DELETE USER DONE!\n")
    res.status(200).json({
        message: `user is deleted successfully! , cloudinary errors : ${error_messages}`
    })
}