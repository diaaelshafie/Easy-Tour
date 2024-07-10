import { touristModel } from "../dataBase/models/tourist.model.js"
import { tourGuideModel } from "../dataBase/models/tourGuide.model.js"

export const checkUserExists = async (email) => {
    const result = {
        message: 'user email is valid',
        found: false
    }
    const isFoundTourist = await touristModel.findOne({ email })

    if (isFoundTourist) {
        console.log({ message: "there is a tourist account found" })
        console.log({
            user_error_message: "there is an account with the entered email",
            entered_email: email,
            found_account_email: isFoundTourist.email
        })
        result.message = `user email already exists!`
        result.found = true
        return result
    }

    const isFoundTourGuide = await tourGuideModel.findOne({ email: email })

    if (isFoundTourGuide) {
        console.log({ message: "there is a tourGuide account found" })
        console.log({
            user_error_message: "there is an account with the entered email",
            entered_email: email,
            found_account_email: isFoundTourGuide.email
        })
        result.message = `user email already exists!`
        result.found = true
        return result
    }
    return result
}
// if (findUser?.email === email) {
//     console.log({
//         api_error_message: "user shouldn't be found!",
//         user: findUser
//     })
//     return next(new Error('email already exists!', { cause: 400 }))
// } else if (findUser?.userName === userName) {
//     console.log({
//         api_error_message: "username duplication!",
//         req_body_username: userName,
//         existing_username: findUser?.userName
//     })
//     return next(new Error('userName already exists!', { cause: 400 }))
// }

export const saveUserSocket = async (email, socketID) => {
    try {
        const getUser = await Promise.all([
            touristModel.findOneAndUpdate({ email }, { socketID }).select('userName email socketID'),
            tourGuideModel.findOneAndUpdate({ email }, { socketID }).select('firstName email socketID')
        ])

        if (!getUser) {
            console.log({ message: "user has not been found anywhere!" })
            return false
        }

        if (getUser[0]) {
            console.log({
                message: "tourist found!",
                found_tourist: getUser[0]
            })
            return true
        } else if (getUser[1]) {
            console.log({
                message: "tour guide found!",
                found_tour_guide: getUser[1]
            })
            return true
        }
        return false
    } catch (error) {
        console.log({
            error_message: "failed to find the user and update the socketID",
            error: error
        })
        return false
    }
}