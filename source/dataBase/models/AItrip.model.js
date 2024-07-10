import { Schema, model } from 'mongoose'
import { TGtripStatuses, tripDateStatuses } from '../../utilities/activityStatuses.js'

const DayPlacesSchema = new Schema({
    placeName: String,
    longitude: Number,
    latitude: Number,
    activity: String,
    category: String,
    time: String,
    budget: Number
})

const schema = new Schema({
    tripDetails: {
        type: Map,
        of: [DayPlacesSchema]
    },
    touristId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    status: { // NOTE: this is the trip status with date not with rooms !
        type: String,
        required: false,
        default: tripDateStatuses.NA,
        enum: [
            tripDateStatuses.completed, tripDateStatuses.current, tripDateStatuses.upcoming, tripDateStatuses.NA
        ]
    },
    title: {
        type: String,
        required: true
    },
    from: {
        type: String,
        required: true
    },
    to: {
        type: String,
        required: true
    },
})

export const AItripModel = model('AItrip', schema)