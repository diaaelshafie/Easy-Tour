import { TourGuideTripsModel } from '../dataBase/models/tourGuideTrips.model.js'
import { tripDaysModel } from '../dataBase/models/TGtripDays.model.js'

export const deleteAssociatedTrips = async (tourGuide_id) => {
    console.log("\nDeleting associated trips of the tourGuide\n")

    const returnObject = {
        query_errors: []
    }

    let getAssociatedTrips
    try {
        getAssociatedTrips = await TourGuideTripsModel.find({ createdBy: tourGuide_id })
            .populate('tripDetails')

        console.log({
            message: "tourGuide associated trips are found!",
            found_trips: getAssociatedTrips
        })
    } catch (error) {
        console.log({
            query_message: "failed to fetch the data",
            query_error: error
        })
        returnObject.query_errors.push(error?.message)
    }

    try {
        getAssociatedTrips.forEach(async (trip) => {
            await TourGuideTripsModel.deleteOne({ _id: trip._id })
                .then((result) => {
                    console.log({
                        message: `trip ${trip.title} is deleted!`,
                        result: result?.acknowledged
                    })
                })
            const trip_days = trip.tripDetails
            let i = 0
            trip_days.forEach(async (day) => {
                await tripDaysModel.deleteOne({ _id: day._id })
                    .then((result) => {
                        console.log({
                            message: `trip day${i} is deleted!`,
                            result: result.acknowledged
                        })
                        i++
                    })
            })
        })
    } catch (error) {
        console.log({
            query_message: "failed to delete the data",
            query_error: error
        })
        returnObject.query_errors.push(error?.message)
    }

    return returnObject
    // try to delete with populate in a test code and see if it works 

    // const deleteAssocTrips = await TourGuideTripsModel.deleteMany({
    //     createdBy: tourGuide_id
    // })



}