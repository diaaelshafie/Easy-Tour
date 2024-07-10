import { Schema, model } from 'mongoose'

const dayPlacesSchema = new Schema({
    placeName: String,
    placeType: String,
    longitude: String,
    latitude: String,
    activity: String
})

const schema = new Schema({
    dayName: {
        type: String,
        required: true
    },
    // tripID: { // this needs to be removed since it will make a paradox in the API
    //     type: Schema.Types.ObjectId,
    //     ref: 'TourGuideTrip',
    //     required: true
    // },
    dayPlaces: [dayPlacesSchema]
}, {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
})

schema.virtual('Trips', {
    ref: 'TourGuideTrip',
    localField: '_id',
    foreignField: 'tripDetails'
})

export const tripDaysModel = model('TripDay', schema)