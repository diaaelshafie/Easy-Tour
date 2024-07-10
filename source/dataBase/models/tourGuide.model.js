import { Schema, model } from "mongoose"
import { systemRoles } from "../../utilities/systemRoles.js"
import { statuses } from "../../utilities/activityStatuses.js"
import { TourGuideTripsModel } from './tourGuideTrips.model.js'

const schema = new Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    firsNameSlug: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    lastNameSlug: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    address: { // TODO : search on longitude and latitude and how to get an address as a string
        type: String,
        required: true
    },
    birthDate: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    phoneNumber: {
        type: String,
        required: true
    },
    languages: { // array of strings
        type: [String],
        required: true
    },
    // images
    profilePicture: {
        secure_url: {
            type: String
        },
        public_id: {
            type: String
        }
    },
    // ministry ID (ministry license in backend) -> 1 image
    ministyliscence: { // not in the ocr
        // image
        secure_url: {
            type: String
        },
        public_id: {
            type: String
        }
    },
    syndicateLiscence: { // ocr
        // image
        secure_url: {
            type: String
        },
        public_id: {
            type: String
        }
    },
    CV: { // CV 
        // file -> pdf 
        secure_url: {
            type: String
        },
        public_id: {
            type: String
        }
    },
    customId: String,
    token: String, // login token
    // user statuses
    status: {
        type: String,
        enum: [statuses.online, statuses.offline, statuses.doNotDisturb],
        default: statuses.offline
    },
    verified: {
        type: Boolean,
        default: false
    },
    confirmed: {
        type: Boolean,
        default: false
    },
    resetCode: String, // reset code (password reset)
    forgetPassword: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: [systemRoles.tourGuide],
        default: systemRoles.tourGuide
    },
    contact_info: { // in edit profile not sign up
        whatsapp: { // EDIT -> whatsapp
            type: String
        },
        facebook: {
            type: String
        },
        instagram: {
            type: String
        },
        twitter: {
            type: String
        },
        linkedIn: {
            type: String
        }
    },
    createdTrips: [{
        type: Schema.Types.ObjectId,
        ref: 'TourGuideTrip'
    }],
    socketID: {
        type: String,
    },
    devicePushToken: {
        type: String,
        required: false
    }
}, {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
})

// this virtual field was made only as a link and was bypassed in a query that populates that field but with the bypassing expression (but failed)
schema.virtual('chats', {
    localField: '_id',
    foreignField: 'POne.ID',
    ref: 'Chats'
})

export const tourGuideModel = model('TourGuide', schema)

// schema.pre('findOneAndDelete', async function (next) {
//     const deleteRelatedTrips = await TourGuideTripsModel.deleteMany(this.createdTrips)
// })
// generate trips model

// generate trip by the tourguide