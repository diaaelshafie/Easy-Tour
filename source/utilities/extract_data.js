import { TGtripRequestStatuses } from "./activityStatuses.js"

export const getRestaurant = function (res) {
    const data = {
        name: res.name || null,
        description: res.description || null,
        website: res.website || null,
        web_url: res.web_url || null,
        email: res.email || null,
        phone: res.phone || null,
        features: res.features || null,
        rating: res.rating || null,
        price_level: res.price_level || null,
        cuisine: res.cuisine || null,
        rating_image_url: res.rating_image_url || null,
        num_reviews: res.num_reviews || null,
        address_obj: {
            address_string: res.address_obj?.address_string || null
        },
        hours: {
            weekday_text: res.hours?.weekday_text || null
        }
    }
    return data
}

export const getHotel = function (res) {
    const data = {
        name: res.name || null,
        website: res.website || null,
        web_url: res.web_url || null,
        email: res.email || null,
        amenities: res.amenities || null,
        rating: res.rating || null,
        price_level: res.price_level || null,
        address_obj: {
            address_string: res.address_obj?.address_string || null
        }
    }
    return data
}

export const getImages = function (res) {
    let images = []
    for (const image of res.data.data) {
        if (image.images.original) {
            images.push(image.images.original.url || null)
        } else if (image.images.medium) {
            images.push(image.images.medium.url || null)
        } else {
            images.push(image.images.small.url || null)
        }
    }
    return images
}



// user , userName # , email # ,country # , countryFlag #, phoneNumber # , age # , totalPrice # , trip , tripType, startTripDate, travelers , comment
export const setTripRequestData = function ({
    user, userName = null, email = null, country = null, countryFlag = null,
    phoneNumber = null, age = null, totalPrice = null, trip, tripType = null, startTripDate = null, travelers = 0, comment = ''
}) {
    const reqData = {
        requestedBy: {
            ID: user._id,
            systemEmail: user.email,
            userName: userName || user.userName,
            image: user.profilePicture?.secure_url || null,
            email: email || user.email,
            country: country || user.country || null,
            countryFlag: countryFlag || user.countryFlag || null,
            phoneNumber: phoneNumber || user.phoneNumber || null,
            age: age || user.age || null,
            totalPrice: totalPrice
        },
        requestedTo: trip.createdBy,
        requestedTrip: {
            ID: trip._id,
            image: trip.image?.secure_url || null,
            title: trip.title || null,
            brief: trip.brief || null
        },
        requestDetails: {
            tripType: tripType,
            startDate: startTripDate || null,
            additionalTravelersNo: travelers || 0
        },
        requestStatus: TGtripRequestStatuses.not_handled,
        requestComment: comment || ''
    }

    return reqData
}