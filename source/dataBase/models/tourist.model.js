import { Schema, model } from "mongoose"
import { systemRoles } from "../../utilities/systemRoles.js"
import { statuses } from "../../utilities/activityStatuses.js"
import { languages, languagesCodes } from "../../utilities/languages.js"
import { socialProviders } from "../../utilities/socialProviders.js"

// TODO : add "socketId" field here

const touristSchema = new Schema({
    // userName , email , pass -> are the main data for request in sign Up , the rest should be not required
    userName: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
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
    gender: {
        type: String,
        enum: ['male', 'female', 'Male', 'Female', 'MALE', 'FEMALE', 'not specified'], // not specified -> means the user didn't say male or female
        default: 'not specified'
    },
    age: {
        type: Number,
    },
    phoneNumber: {
        type: String,
    },
    language: {
        type: String,
        default: languagesCodes.eng
    },
    role: {
        type: String,
        enum: [systemRoles.tourist],
        default: systemRoles.tourist
    },
    profilePicture: {
        secure_url: {
            type: String,
        },
        public_id: {
            type: String,
        },
    },
    coverPicture: {
        secure_url: {
            type: String,
        },
        public_id: {
            type: String,
        },
    },
    status: {
        type: String,
        enum: [statuses.online, statuses.offline, statuses.doNotDisturb],
        default: statuses.offline
    },
    customId: String,
    confirmed: {
        type: Boolean,
        default: false
    },
    provider: {
        type: String,
        required: false,
        enum: socialProviders,
        default: socialProviders.default
    },
    token: String, // login token
    resetCode: String, // reset code (password reset)
    forgetPassword: {
        type: Boolean,
        default: false
    },
    country: { // nationality
        type: String,
        required: false
    },
    preferences: {
        type: [String]
    },
    countryFlag: { // will be sent in : edit profile 
        // will be get in view profile
        type: String
    },
    trips: [{
        type: Schema.Types.ObjectId,
        ref: 'TourGuideTrip'
    }],
    favouriteHistoricPlaces: [{
        type: Schema.Types.ObjectId,
        ref: 'historicMP_place'
    }],
    favouriteEntertainmentPlaces: [{
        type: Schema.Types.ObjectId,
        ref: 'entertainmentMP_place'
    }],
    socketID: {
        type: String,
    },
    devicePushToken: {
        type: String,
        required: false
    }
    // address: { (real time -> socket.io)
    // }
    // refreshCounter : {
    //     type:Number,
    //     max:4
    // }
}, {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
})

touristSchema.virtual('AItrips', {
    foreignField: 'touristId',
    localField: '_id',
    ref: 'AItrip'
})

export const touristModel = model('Tourist', touristSchema)