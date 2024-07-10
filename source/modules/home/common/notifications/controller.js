import {
    sendPushNotifications, tourGuideModel, touristModel, FCMPushTokenAction, StatusCodes
} from '../controller.imports.js'

export const storeFCMPushToken = async (req, res, next) => {
    const getUser = req.authUser
    const { pushToken, action } = req.body

    if (action === FCMPushTokenAction.refresh && pushToken) {
        getUser.devicePushToken = pushToken
        await getUser.save()
            .then(res => console.log({ message: "user device push token is updated successfully!" }))
            .catch((err) => {
                console.log({ message: "error in updating the device push token", error: err })
                return next(new Error("error in updating the device push token", { cause: StatusCodes.INTERNAL_SERVER_ERROR }))
            })
    } else if (action === FCMPushTokenAction.disable) {
        getUser.devicePushToken = null
        await getUser.save()
            .then(res => console.log({ message: "user device push token is deleted successfully!" }))
            .catch((err) => {
                console.log({ message: "error in deleting the device push token", error: err })
                return next(new Error("error in deleting the device push token", { cause: StatusCodes.INTERNAL_SERVER_ERROR }))
            })
    } else if (action === FCMPushTokenAction.enable && pushToken) {
        if (getUser.devicePushToken !== null) {
            // conflict 409
            return next(new Error("user has already activated push notifications", { cause: StatusCodes.CONFLICT }))
        }
        getUser.devicePushToken = pushToken
        await getUser.save()
            .then(res => console.log({ message: "user device push token is updated successfully!" }))
            .catch((err) => {
                console.log({ message: "error in updating the device push token", error: err })
                return next(new Error("error in updating the device push token", { cause: StatusCodes.INTERNAL_SERVER_ERROR }))
            })
    } else {
        console.log({ message: "wrong action", request_body: req.body })
        return next(new Error("wrong action!", { cause: StatusCodes.BAD_REQUEST }))
    }

    res.status(StatusCodes.NO_CONTENT).json({})
}