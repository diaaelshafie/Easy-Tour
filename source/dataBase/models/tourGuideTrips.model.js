import { Schema, model } from 'mongoose'
import { TGtripStatuses } from '../../utilities/activityStatuses.js'

const schema = new Schema({
    title: {
        type: String,
        required: true
    },
    brief: {
        type: String,
        default: "",
        required: false
    },
    // ticketPerPerson: {
    //     type: Number,
    //     required: true
    // },
    plans: {
        standard: Number,
        luxury: Number,
        VIP: Number
    },
    maximumNumber: {
        type: Number,
        min: 1,
        required: true
    },
    image: {
        secure_url: {
            type: String
        },
        public_id: {
            type: String
        }
    },
    // images: [{
    //     secure_url: {
    //         type: String
    //     },
    //     public_id: {
    //         type: String
    //     }
    // }],
    customId: {
        type: String,
        required: false
    },
    createdBy: { // tourGuide _id
        type: Schema.Types.ObjectId,
        ref: 'TourGuide',
        required: true
    },
    subscribers: [{
        type: Schema.Types.ObjectId,
        ref: 'Tourist'
    }],
    // create Trip details
    tripDetails: [{
        type: Schema.Types.ObjectId,
        ref: 'TripDay' // tripDays
    }],
    status: { // reservation status (has rooms for tourists or not)
        type: String,
        required: false,
        default: TGtripStatuses.empty,
        enum: [
            TGtripStatuses.complete, TGtripStatuses.done, TGtripStatuses.empty,
            TGtripStatuses.pending, TGtripStatuses.started
        ]
    },
    currentTravelersNo: {
        type: Number,
        required: false,
        min: 0,
        default: 0,
        validate: {
            validator: function (value) {
                return value <= this.maximumNumber
            },
            message: 'currentTravelersNo should not exceed maximumNumber'
        }
    },
    included: [String],
    excluded: [String],
    // from , to (date) :
    from: {
        type: String,
        required: false
    },
    to: {
        type: String,
        required: false
    }
}, {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
})

// virtuals may not be needed!

schema.virtual('Tourists', {
    ref: 'Tourist',
    localField: '_id',
    foreignField: 'trip'
})

schema.virtual('TourGuides', {
    ref: 'TourGuide',
    localField: '_id',
    foreignField: 'createdTrips'
})

export const TourGuideTripsModel = model('TourGuideTrip', schema)