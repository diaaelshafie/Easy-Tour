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
        enum: ['monument', 'islamic'],
        default: 'monument'
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

export const historicMP_Model = model('historicMP_place', schema)