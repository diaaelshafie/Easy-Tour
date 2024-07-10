// deprecated schema

import { Schema, model } from 'mongoose'

const DayPlacesSchema = new Schema({
    placeName: String,
    longitude: Number,
    latitude: Number,
    activity: String,
    category: String
})

const schema = new Schema({
    dayPlaces: [DayPlacesSchema]
})

export const AItripDaysModel = model('AItripDay', schema)