import { customTripModel } from "../../../../../dataBase/models/customTrip.model.js"
import { StatusCodes, ReasonPhrases } from 'http-status-codes'

export const createTrip = async (req, res, next) => {
    console.log("\nTOURIST CREATE CUSTOM TRIP!\n")
    const getUser = req.authUser
    const { title, startDate, endDate, tripDetails } = req.body

    // we need to make sure that the trip title is unique to the user trips only not all the trips in the database
    const isTitleUnique = await customTripModel.find({
        title,
        tourist: getUser._id
    })
    if (isTitleUnique.length > 0) {
        console.log("message: the title entered is not unique !")
        console.log({ the_duplicate_trips: isTitleUnique })
        return res.status(StatusCodes.BAD_REQUEST).json({
            message: "the title entered is not unique"
        })
    }
    console.log("the trip title is unique and valid !")

    const saveTrip = await customTripModel.create({
        tourist: getUser._id,
        startDate,
        title,
        endDate,
        tripDetails
    })

    if (!saveTrip) {
        console.log('message : failed to save the trip in data base!');
        return next(new Error('error saving the trip in data base!', { cause: StatusCodes.INTERNAL_SERVER_ERROR }))
    }

    console.log("\nTOURIST CREATE CUSTOM TRIP dONE!\n")
    res.status(StatusCodes.NO_CONTENT).json({})
}

export const getAllTrips = async (req, res, next) => {
    const getUser = req.authUser
    const getTrips = await customTripModel.find({
        tourist: getUser._id
    }).select('-tourist')

    if (getTrips.length == 0) {
        console.log('message : there are no trips associated with the user!')
        return res.status(StatusCodes.NO_CONTENT).json({})
    }

    res.status(StatusCodes.OK).json({
        message: "trips are found!",
        trips: getTrips
    })
}

export const editTrip = async (req, res, next) => {
    const getUser = req.authUser
    const { title, startDate, endDate, tripDetails } = req.body
    const { tripId } = req.query

    const getTrip = await customTripModel.findOne({
        tourist: getUser._id,
        _id: tripId
    })

    // to check the uniqueness of the new title
    const isTitleUnique = await customTripModel.find({
        title,
        tourist: getUser._id
    })
    if (isTitleUnique.length > 0) {
        // this case means that the new title is the same as another trip's title
        if (getTrip.title !== title) {
            console.log("message: the title entered is not unique !")
            console.log({ the_duplicate_trips: isTitleUnique })
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "the title entered is not unique"
            })
        }
    }
    console.log("the trip title is unique and valid !")

    const updateTrip = await customTripModel.updateOne({
        _id: tripId
    }, {
        title: title || getTrip.title,
        startDate: startDate || getTrip.startDate,
        endDate: endDate || getTrip.endDate,
        tripDetails: tripDetails || getTrip.tripDetails
    })

    res.status(StatusCodes.CREATED).json({
        message: "trip updated!"
    })
}

export const deleteTrip = async (req, res, next) => {
    const getUser = req.authUser
    const { tripId } = req.query

    const deleteTrip = await customTripModel.findOneAndDelete({
        _id: tripId,
        tourist: getUser._id
    })

    if (!deleteTrip) {
        console.log('message: failed to delete the document from database , the document may not exist')
        return res.status(StatusCodes.BAD_REQUEST).json({
            message: "the document does not exist !"
        })
    }

    res.status(StatusCodes.NO_CONTENT).json({})
}