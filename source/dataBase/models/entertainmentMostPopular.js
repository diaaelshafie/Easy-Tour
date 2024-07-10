import { Schema, model } from 'mongoose'

const schema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true
    },
    type: {
        type: String, // historical monument
        required: true,
        enum: ['cinema', 'restaurant', 'museum', 'bazar', 'medical'],
        default: 'restaurant'
    },
    location: { // the location is not required untill later address understanding resources!
        longitude: {
            type: Number
        },
        latitude: {
            type: Number
        }
    },
    details: String,
    ticket_price: Number,
    image: {
        secure_url: {
            type: String,
        },
        public_id: {
            type: String,
        }
    },
    customId: String
})

export const entertainmentMPmodel = model('entertainmentMP_place', schema)