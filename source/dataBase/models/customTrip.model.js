import { model, Schema } from 'mongoose'

export const categoryValues = ['Cultural Centers', 'Religious Sites', 'Natural Landmarks', 'Historical landmark', 'Bazaar', 'Entertainment Centers', 'Malls']
const TripDayPlacesSchema = new Schema({
    placeName: {
        type: String,
        required: true
    },
    latitude: {
        type: Number,
        required: true,
        min: 0
    },
    longitude: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: String,
        enum: categoryValues
    },
    government: {
        type: String,
    },
    activity: {
        type: String,
    },
    image: {
        type: String,
    },
    priceRange: {
        type: Number,
        min: 0
    }
})
const tripDaysSchema = new Schema({
    dayName: {
        type: String,
        required: true
    },
    dayPlaces: [TripDayPlacesSchema]
})

const TripSchema = new Schema({
    tourist: {
        type: Schema.Types.ObjectId,
        ref: 'Tourist'
    },
    title: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    startDate: {
        type: String,
        required: true
    },
    endDate: {
        type: String,
        required: true
    },
    tripDetails: [tripDaysSchema],
})


export const customTripModel = model('customTrip', TripSchema)