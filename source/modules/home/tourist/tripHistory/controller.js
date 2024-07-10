import { touristModel } from "../../../../dataBase/models/tourist.model.js"
import { TourGuideTripsModel } from "../../../../dataBase/models/tourGuideTrips.model.js"
import {tourGuideModel} from '../../../../dataBase/models/tourGuide.model.js'
import { ReasonPhrases, StatusCodes } from 'http-status-codes'
import { AItripModel } from '../../../../dataBase/models/AItrip.model.js'
import { customTripModel } from '../../../../dataBase/models/customTrip.model.js'
import {tripDateStatuses, tripHistoryTripTypes} from '../../../../utilities/activityStatuses.js'
import {setTripRequestData} from '../../../../utilities/extract_data.js'
import { sendPushNotifications } from "../../../../firebase/pushNotifications.js"


// TODO : add the custom trip data base model when it's created .
// TODO : make a cron job that checks regularly the trips of each tourist and change their status according to their date .
// TODO : add in each trip schema the "date status" field that allows you to complete the task and filter the trips according to their date
// REQUIRED : i need a method that takes the date string and converts it into a number and vise versa
// from string to number : use Date.parse()

export const getAllTrips = async (req, res, next) => {
    console.log("\nTOURIST GET TRIPS HISTORY API!\n")

    const tourist = req.authUser
    const getTrips = await Promise.all([
        TourGuideTripsModel.find({
            subscribers: { $in: tourist._id }
        })
            .select('-subscribers -createdBy -id -createdAt -updatedAt -__v')
            .populate([{ path: 'tripDetails', select: '-createdAt -updatedAt -__v' }]),
        AItripModel.find({
            touristId: tourist._id
        }),
        customTripModel.find({
            tourist: tourist._id
        })
    ])
    
    res.status(StatusCodes.OK).json({
        tourGuideTrips: getTrips[0],
        AITrips: getTrips[1],
        customTrips: getTrips[2]
    })
}

export const reDoTrip = async (req,res,next) => {
    const {tripID,tripType,from,to} = req.body
    const user = req.authUser

    let trip;
    if(tripType == tripHistoryTripTypes.AI) {
        trip = await AItripModel.findOne({_id:tripID ,touristId:user._id})
        if(!trip) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message:"the trip is not found!"
            })
        }
        const nowDate = Date.now()
        const parsedFrom = Date.parse(from)
        
        trip.from = from
        trip.to = to

        if(parsedFrom > nowDate) { // if the date is in the future
            trip.status = tripDateStatuses.upcoming
        } else { // if the date is in the past or literally the present (can't happen since the request takes time even if it's in ms)
            trip.status = tripDateStatuses.current
        }
        await trip.save()
        return res.status(StatusCodes.OK).json({
            message:"AI trip is now active again"
        })
        
    } else if (tripType == tripHistoryTripTypes.custom) {
        trip = await customTripModel.findOne({_id: tripID , tourist:user._id})
        if(!trip) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message:"the trip is not found!"
            })
        }
        console.log({foundTrip:trip})
        trip.startDate = from
        trip.endDate = to
        await trip.save()
        return res.status(StatusCodes.OK).json({
            message:"custom trip is now active again"
        })
    } else {
        // if the trip is a tour guide trip :
        trip = await TourGuideTripsModel.findOne({_id: tripID , subscribers: { $in: user._id }})
        if(!trip) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message:"the trip is not found!"
            })
        }

        const data = setTripRequestData({
            user, trip
        })

        const newRequest = await TGtripReqsModel.create(data)
        if (!newRequest) {
            console.log({
                error_message: "request couldn't be created!"
            })
            return next(new Error("request couldn't be created!", { cause: StatusCodes.INTERNAL_SERVER_ERROR }))
        }
        if (newRequest.errors) {
            console.log({
                error_message: "error while creating the request!",
                error: newRequest.errors
            })
            return next(new Error("error while creating the request!", { cause: StatusCodes.BAD_REQUEST }))
        }
        console.log({
            message: "request created!"
        })
        const getTourGuide = await tourGuideModel.findById(trip.createdBy)
        
        if (getTourGuide.devicePushToken !== null) {
            const title = `${user.userName}`
            const body = `hello ${getTourGuide.firstName} , i want to join your trip !`
            const sendNotification = sendPushNotifications(getTourGuide.devicePushToken, title, body)
                .then((res) => {
                    console.log({
                        message: "notification is sent successfully!",
                        result: res
                    })
                })
                .catch((error) => {
                    console.log({
                        message: "failed to send the notification to the tour guide!",
                        error: error
                    })
                })
            console.log({ send_notification: sendNotification })
    
        } else {
            console.log({
                message: "can't send the notification to the user as the user doesn't allow the app to send notifications"
            })
        }

        return res.status(StatusCodes.OK).json({
            message:"tour guide trip request is sent !"
        })
    }

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message:"unexpected error"
    })

    // will it be the same logic for all trips ? 
    /** if :
     * 1. tour guide trip , then we must send a request once again for the tour guide (that's unique to the tour guide trips)
     * 2. AI trip , then i need to simply restart the trip -> (reset the trip's start , end date and set it to active)
     * 3. custom trip , then i just need to reset the trip's start , end date
     */
}

export const deleteTrip = async (req,res,next) => {
    const {tripID , tripType} = req.body
    const user = req.authUser
    let message , code ;
    if(tripType == tripHistoryTripTypes.AI) {
        // if the trip is an AI trip
        const deletedTrip = await AItripModel.deleteOne({
            _id: tripID,
            touristId: user._id
        })
        if(!deletedTrip.deletedCount) {
            console.log({
                message:"failed to delete the AI trip !",
                deleted_trip:deletedTrip
            })
            code = 400
            message = `failed to delete the AI trip !`
        } else {
            console.log("AI trip is deleted successfully !")
            code = 200
            console.log(deletedTrip)
            message = "AI trip is deleted successfully !"
        }
    } else if (tripType == tripHistoryTripTypes.custom) {
        // if the trip is a custom trip
        const deletedTrip = await customTripModel.deleteOne({
            _id:tripID,
            tourist: user._id
        })
        if(!deletedTrip.deletedCount) {
            console.log({
                message: "failed to delete the custom trip !",
                deleted_trip:deletedTrip
            })
            code = 400
            message =`failed to delete the custom trip !`
        } else {
            console.log("custom trip is deleted successfully !")
            code = 200
            console.log(deletedTrip)
            message = "custom trip is deleted successfully !"
        }
    } else {
        // if the trip is a tour guide trip -> will unsubscribe the user from the trip even if it is ended !
        const deletedTrip = await TourGuideTripsModel.findOneAndUpdate({
            _id: tripID,
            subscribers: {$in: user._id}
        } , {
            $pull: {subscribers: user._id}
        })
        if(!deletedTrip) {
            console.log({
                message: "failed to remove the user from the subscribers!",
                deleted_trip:deletedTrip
            })
            code = 400
            message = `failed to remove the user from the subscribers!`
        } else {
            console.log({
                message:"user removed from subscribers successfully!",
                subscribers_after:res.subscribers
            })
            code = 200
            console.log(deletedTrip)
            message = "user removed from subscribers successfully!"
        }
    }

    res.status(code).json({
        message:message
    })
}

        // let current = []
        // let upcoming = []
        // let completed = []
    
        // if (getTrips[0].length) {
        //     console.log("tour guide trips are found!")
        //     getTrips[0].forEach(trip => {
        //         console.log(Date.parse(trip.from));
        //         console.log(typeof (Date.parse(trip.to)));
        //         console.log(Date.now().valueOf())
        //     });
        //     res.status(StatusCodes.OK).json({
        //         message: "trips are found!",
        //         tourGuideTrips: getTrips[0],
        //         AI_trips: getTrips[1]
        //     })
        // }
        // if (getTrips[0].length !== null || getTrips[1].length !== null) {
        //     console.log("trips are found!")
        //     return res.status(StatusCodes.OK).json({
        //         message: "trips are found!",
        //         tourGuideTrips: getTrips[0],
        //         AI_trips: getTrips[1]
        //     })
        // } else {
        //     return res.status(StatusCodes.NO_CONTENT).json({})
        // }
