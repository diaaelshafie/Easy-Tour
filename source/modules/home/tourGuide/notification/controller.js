import { StatusCodes } from 'http-status-codes'
import {
    TGtripReqsModel, TourGuideTripsModel, getIo, tourGuideModel, tripDaysModel, tripRequestAnswer, TGtripRequestStatuses, TGtripStatuses,
    sendPushNotifications, touristModel
} from './controller.imports.js'

// TODO : in the future after you implement the notifications module generally , merge this API into one with the rest that use notifications into one API
export const getAllRequests = async (req, res, next) => {
    console.log("\nTOUR GUIDE GET REQUESTS API!\n")
    const getUser = req.authUser

    const getRequests = await TGtripReqsModel.find({
        requestedTo: getUser._id
    }).select('-requestedBy.ID -requestedTo')
    if (!getRequests) {
        console.log({
            server_error_message: "failed to get the associated requests!"
        })
        return next(new Error('failed to get the associated requests!', { cause: StatusCodes.INTERNAL_SERVER_ERROR }))
    }
    else if (getRequests.length == 0) {
        console.log({
            message: "query is successful but there are no data!"
        })
        console.log("\nTOUR GUIDE GET REQUESTS API DONE\n")
        // you will return the response empty without data when there are no data to return !
        return res.status(StatusCodes.NO_CONTENT).json()
    }

    console.log({
        message: "requests are found!",
        dataLength: getRequests.length
    })

    console.log("\nTOUR GUIDE GET REQUESTS API DONE!\n")
    res.status(StatusCodes.OK).json({
        message: "requests found!",
        requests: getRequests
    })
}

export const handleRequest = async (req, res, next) => {
    console.log("\nTOUR GUIDE HANDLE REQUEST API!\n")
    const getUser = req.authUser
    const { requestID, answer, tripID } = req.body

    const getRequest = await TGtripReqsModel.findOne({ _id: requestID, requestedTo: getUser._id })
    if (!getRequest) {
        console.log({ message: "couldn't get the request from the database!" })
        return next(new Error("couldn't get the request from the database!", { cause: StatusCodes.INTERNAL_SERVER_ERROR }))
    }
    if (getRequest.errors) {
        console.log({
            message: "error in getting the request",
            database_errors: getRequest.errors
        })

        return next(new Error(`error in getting the request , errors: ${getRequest.errors}`, { cause: StatusCodes.BAD_REQUEST }))
    }
    console.log({ message: "request is found!", found_request: getRequest })

    const getRequestingTourist = await touristModel.findById(getRequest.requestedBy.ID)
    console.log({ found_request_tourist: getRequestingTourist })

    const getTrip = await TourGuideTripsModel.findOne({
        createdBy: getUser._id,
        _id: tripID
    })
    if (!getTrip) {
        console.log({ message: "the trip doesn't exist! or there is no such trip" })
        return next(new Error("the trip doesn't exist or there is no such trip !"), { cause: StatusCodes.BAD_REQUEST })
    }
    if (getTrip.errors) {
        console.log({
            error_message: "error in database!",
            database_errors: getTrip.errors
        })
        return next(new Error(`error in database! , ${getTrip.errors}`, { cause: StatusCodes.BAD_REQUEST }))
    }
    console.log({
        message: "trip is found!",
        foundTrip: getTrip
    })

    // TODO LATER : trigger a timer to delete this request after if accepted or store it , and if the request is rejected , do the same , search on what's better
    if (answer == tripRequestAnswer.yes) {
        // check if the request is already accepted !
        if (getRequest.requestStatus === TGtripRequestStatuses.accepted) {
            // reset content tells the client to reset the document which sent this request , meaning that the request was sent and done and just needs a page refresh or something
            return res.status(StatusCodes.RESET_CONTENT).json({ message: "request already accepted!" }) // 205
        }

        // this case means that the tour guide wants to increase the travelers even if it overrides the maximum number :
        if (getTrip.maximumNumber === getTrip.currentTravelersNo) {
            // the one is the subscriber who made the request
            getTrip.maximumNumber = getTrip.maximumNumber + getRequest.requestDetails.additionalTravelersNo + 1
            getTrip.currentTravelersNo += (getRequest.requestDetails.additionalTravelersNo + 1)
            console.log({ message: "the new travelers are added!" })
            if (!getTrip.subscribers.includes(getRequest.requestedBy.ID)) {
                getTrip.subscribers.push(getRequest.requestedBy.ID)
                console.log({ message: "the new subscriber is added!" })
            }
            await getTrip.save()
            console.log({ message: "the trip changes are saved!" })
        }
        else if (getTrip.maximumNumber > getTrip.currentTravelersNo) {
            // ex: 8 6 , 4 -> 10 , 10 , 6+4=10 , 10-8=2 , 8+2=10
            if (getTrip.maximumNumber >= (getTrip.currentTravelersNo + getRequest.requestDetails.additionalTravelersNo + 1)) {
                getTrip.currentTravelersNo += (getRequest.requestDetails.additionalTravelersNo + 1)
                console.log({ message: "the new travelers are added!" })
                if (!getTrip.subscribers.includes(getRequest.requestedBy.ID)) {
                    getTrip.subscribers.push(getRequest.requestedBy.ID)
                    console.log({ message: "the new subscriber is added!" })
                }
                await getTrip.save()
                console.log({ message: "the trip changes are saved!" })
            }
            else if (getTrip.maximumNumber < (getTrip.currentTravelersNo + getRequest.requestDetails.additionalTravelersNo + 1)) {
                getTrip.currentTravelersNo = getTrip.currentTravelersNo + getRequest.requestDetails.additionalTravelersNo + 1
                let result = getTrip.currentTravelersNo
                let remainder = result - getTrip.maximumNumber
                getTrip.maximumNumber += remainder
                console.log({ message: "the new travelers are added!" })
                if (!getTrip.subscribers.includes(getRequest.requestedBy.ID)) {
                    getTrip.subscribers.push(getRequest.requestedBy.ID)
                    console.log({ message: "the new subscriber is added!" })
                }
                await getTrip.save()
                console.log({ message: "the trip changes are saved!" })
            }
        }

        getRequest.requestStatus = TGtripRequestStatuses.accepted
        await getRequest.save()
        console.log({ message: "the request is accepted!" })

        if (getRequestingTourist.devicePushToken !== null) {
            const title = 'Your Trip Request Is Accepted!'
            const body = `${getUser.firstName} ${getUser.lastName} accepted your trip request`
            const sendNotification = await sendPushNotifications(getRequestingTourist.devicePushToken, title, body)
            console.log({ sent_notification: sendNotification })
        } else {
            console.log({
                message: "can't send the notification to the user as the user doesn't allow the app to send notifications"
            })
        }
    }
    else {
        // delete the request from the database and send a notification to the user who got his request rejected !
        await TGtripReqsModel.deleteOne({ _id: requestID })
            .then((res) => {
                console.log({
                    message: "request deleted!",
                    result: res
                })
            })
            .catch((error) => {
                console.log({
                    message: "failed to delete the request from the database!",
                    error: error
                })
            })
        // TODO : send the notification to the user !
        if (getRequestingTourist.devicePushToken !== null) {
            const title = 'Your Trip Request Is Rejected!'
            const body = `${getUser.firstName} ${getUser.lastName} rejected your trip request`
            const sendNotification = await sendPushNotifications(getRequestingTourist.devicePushToken, title, body)
            console.log({ sent_notification: sendNotification })
        } else {
            console.log({
                message: "can't send the notification to the user as the user doesn't allow the app to send notifications"
            })
        }

        return res.status(StatusCodes.OK).json({
            message: "request is rejected!"
        })
    }


    console.log("\nTOUR GUIDE HANDLE REQUEST API DONE!\n")
    res.status(StatusCodes.NO_CONTENT).json()
}