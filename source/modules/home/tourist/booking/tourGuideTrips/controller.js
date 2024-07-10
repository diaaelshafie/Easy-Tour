import {
    TourGuideTripsModel, paginate, tourGuideModel, touristModel, tripDaysModel,
    cloudinary, emailService, StatusCodes, getIo, TGtripReqsModel, TGtripRequestStatuses,
    sendPushNotifications
} from './controller.imports.js'

export const getTripsLength = async (req, res, next) => {
    console.log("\nTOURIST GET TRIPS LENGTH API DONE!\n")

    const AllTrips = await TourGuideTripsModel.find()
    let length = 0
    AllTrips.forEach((trip) => {
        length++
    })

    console.log("\nTOURIST GET TRIPS LENGTH API DONE!\n")
    res.json({
        tripsLength: length
    })
}

export const getAllTrips = async (req, res, next) => {
    console.log("\nTOURIST GET ALL TRIPS API!\n")

    const getUser = req.authUser
    console.log({ query: req.query })
    const excludeQueryParams = ['page', 'size', 'sort', 'search', 'fields']
    const filterQuery = { ...req.query }
    excludeQueryParams.forEach(param => {
        delete filterQuery[param]
    })

    console.log({
        query_after_parsing: JSON.parse(JSON.stringify(filterQuery).replace(/(gt|gte|lt|lte|in|nin|eq|neq)/g, match => `$${match}`))
    })

    // filter query params example :   stock[$lte]=50 -> stock: {'$lte':'50'}

    // HANDLE THE FILTERING if it didn't exist and if it got errors 
    const mongooseQuery = TourGuideTripsModel.find(
        JSON.parse(JSON.stringify(filterQuery).replace(/(gt|gte|lt|lte|in|nin|eq|neq)/g, match => `$${match}`))
    )
    mongooseQuery.populate(
        [
            {
                path: 'createdBy',
                select: '-_id profilePicture.secure_url email'
            },
            {
                path: 'tripDetails'
            }
        ]
    )
    // JSON.parse(JSON.stringify(filterQuery).replace(/(gt|gte|lt|lte|in|nin|eq|neq)/g, match => `$${match}`))
    // select the profile image , email
    if (req.query.sort) {
        mongooseQuery.sort(req.query.sort.replaceAll(",", " "))
    }

    if (req.query.page && req.query.size) {
        const { skip, limit } = paginate(req.query.page, req.query.size)
        mongooseQuery.limit(limit).skip(skip)
    }

    const result = await mongooseQuery

    console.log("\nTOURIST GET ALL TRIPS API DONE!\n")
    res.status(200).json({
        tourGuideTrips: result,
    })
}

export const getTheTourGuideProfile = async (req, res, next) => {
    console.log("\nTOURIST GET TOUR GUIDE PROFILE API!\n")

    const getUser = req.authUser
    const { email } = req.body
    const getTourGuide = await tourGuideModel.findOne({ email })
        .select(
            '-_id firstName lastName email address birthDate description phoneNumber languages status verified createdTrips ministyliscence.secure_url syndicateLiscence.secure_url CV.secure_url profilePicture.secure_url'
        )
        .populate(
            {
                path: 'createdTrips',
                populate: {
                    path: 'tripDetails'
                }
            }
        )
    if (!getTourGuide) {
        console.log({
            error_message: "tour guide doesn't exist"
        })
        return next(new Error('tour guide is not found!', { cause: StatusCodes.BAD_REQUEST }))
    }
    // else {
    //     if (getTourGuide.errors !== null) {
    //         console.log({
    //             query_error_message: "error regarding the query",
    //             query_error: getTourGuide.errors?.message
    //         })
    //         return next(new Error('server-query error!', { cause: StatusCodes.INTERNAL_SERVER_ERROR }))
    //     }
    // }

    console.log("\nTOURIST GET TOUR GUIDE PROFILE API DONE!\n")
    res.status(StatusCodes.OK).json({
        message: "tour guide is found!",
        tour_guide: getTourGuide
    })
}

export const requestToJoinTrip = async (req, res, next) => {
    console.log("\nTOURIST SEND TRIP REQUEST API!\n")

    const getUser = req.authUser
    const {
        tripID, userName, startTripDate, email, country, countryFlag, phoneNumber, tripType, travelers, age, totalPrice, comment
    } = req.body

    const getTrip = await TourGuideTripsModel.findById(tripID)
    if (!getTrip) {
        console.log({
            error_message: "tourGuide trip doesn't exist!"
        })
        return next(new Error("tourGuide trip doesn't exist!", { cause: StatusCodes.BAD_REQUEST }))
    }
    console.log({
        tripFound: getTrip
    })

    const getTourGuide = await tourGuideModel.findById(getTrip.createdBy)
    if (!getTourGuide) {
        console.log({
            error_message: "tourGuide doesn't exist!"
        })
        return next(new Error("tourGuide doesn't exist!", { cause: StatusCodes.BAD_REQUEST }))
    }
    console.log({
        message: "tourGuide is found!"
    })

    const reqData = {
        requestedBy: {
            ID: getUser._id,
            systemEmail: getUser.email,
            userName: userName || getUser.userName,
            image: getUser.profilePicture?.secure_url || null,
            email: email || getUser.email,
            country: country || getUser.country || null,
            countryFlag: countryFlag || getUser.countryFlag || null,
            phoneNumber: phoneNumber || getUser.phoneNumber || null,
            age: age || getUser.age || null,
            totalPrice: totalPrice
        },
        requestedTo: getTrip.createdBy,
        requestedTrip: {
            ID: getTrip._id,
            image: getTrip.image?.secure_url || null,
            title: getTrip.title || null,
            brief: getTrip.brief || null
        },
        requestDetails: {
            tripType: tripType,
            startDate: startTripDate || null,
            additionalTravelersNo: travelers || 0
        },
        requestStatus: TGtripRequestStatuses.not_handled,
        requestComment: comment || ''
    }

    const newRequest = await TGtripReqsModel.create(reqData)
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

    // TODO : add the push notification here -> tourGuide   
    if (getTourGuide.devicePushToken !== null) {
        const title = `${getUser.userName}`
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

    console.log("\nTOURIST SEND TRIP REQUEST API DONE!\n")
    res.status(StatusCodes.NO_CONTENT).json() // 204
}