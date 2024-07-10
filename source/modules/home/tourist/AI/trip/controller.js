import {
    AItripModel, StatusCodes, axios, getRestaurant, getHotel, getImages
} from './cont.imports.js'

export const createAItrip = async (req, res, next) => {
    console.log("\nAI SAVE TRIP API\n")
    const { tripDetails, from, to, title } = req.body
    const getUser = req.authUser
    console.log(tripDetails)
    let tripData = {
        tripDetails,
        title,
        from,
        to,
        touristId: getUser._id
    }
    // TODO : make a variable in the req.body that has the tripData of the AI generated trip
    // req.body has nothing but the result of the AI model
    let saveTrip
    try {
        saveTrip = await AItripModel.create(tripData)
        console.log({ message: "tripData is saved successfully!" })
    } catch (error) {
        console.log({ error })
        return next(new Error('error in savving the data in the data base!', { cause: StatusCodes.INTERNAL_SERVER_ERROR }))
    }
    tripData = null
    console.log("\nAI SAVE TRIP API DONE\n")
    res.status(StatusCodes.OK).json({
        message: "AItrip is saved!", // ##
        saved_AI_trip_for_testing: saveTrip
    })
}

export const getTrip = async (req, res, next) => {
    console.log("\nAI GET TRIP API\n")
    const getUser = req.authUser
    const { tripId } = req.body
    const getTrip = await AItripModel.findOne({
        touristId: getUser._id,
        _id: tripId
    })
    if (!getTrip) {
        console.log({ message: "the wanted trip doesn't exist!" })
        return next(new Error("trip doesn't exist!", { cause: StatusCodes.BAD_REQUEST }))
    }
    if (getTrip.errors) {
        console.log({
            query_error_message: "failed to get the trip",
            query_error: getTrip.errors
        })
        return next(new Error(`error in database , error: ${getTrip.errors}`, { cause: StatusCodes.INTERNAL_SERVER_ERROR }))
    }
    console.log("\nAI GET TRIP API DONE!\n")
    res.status(StatusCodes.OK).json({
        message: "trip is found!",
        found_ai_trip: getTrip
    })
}

export const getNearbyPlaces = async (req, res, next) => {
    console.log({ request_query: req.query })
    const { long, lat, category } = req.query
    const categ_param = `&category=${category}`
    const nearby_params = '&language=en&radius=2&radiusUnit=km'
    const url = `${process.env.trip_adv_nearby_end}?latLong=${lat}%2C${long}${categ_param}${nearby_params}&key=${process.env.trip_advisor_API_key}`
    console.log({
        url_to_be_sent: url
    })

    const places = await axios.get(
        url, {
        headers: {
            Accept: 'application/json'
        }
    })
    console.log({ message: "nearby API is done" })
    if (places.error) {
        console.log({
            service_error_message: "service error while getting places",
            service_error: places.error
        })
        return next(new Error('API service failed', { cause: StatusCodes.INTERNAL_SERVER_ERROR }))
    }
    console.log({ message: "nearby API is successful!" })

    let placesIDs = []
    for (const place of places.data.data) {
        placesIDs.push(place.location_id)
    }
    console.log({ IDs: placesIDs, IDs_length: placesIDs.length })

    
    let details_requests = []
    for (let i = 0; i < placesIDs.length; i++) {
        details_requests.push(
            axios.get(
                `${process.env.trip_adv_loc_end}/${placesIDs[0]}/details?language=en&currency=EGP&key=${process.env.trip_advisor_API_key}`, {
                headers: { Accept: 'application/json' }
            }
            )
        )
    }
    const details_responses = await Promise.all(details_requests).then(result => {
        console.log({ result })
        if (category === 'restaurants') {
            return result.map(res => {
                console.log({ res_data: res.data })
                res = getRestaurant(res.data)
                return res
            })
        } else {
            return result.map(res => {
                // console.log({ response })
                console.log({ res_data: res.data })
                res = getHotel(res.data)
                return res
            })
        }
    })
    console.log({ details_responses })



    let images_requests = []
    for (let i = 0; i < placesIDs.length / 2; i++) {
            images_requests.push(axios.get(
                `${process.env.trip_adv_loc_end}/${placesIDs[i]}/photos?language=en&currency=EGP&key=${process.env.trip_advisor_API_key}`, {
                headers: { Accept: 'application/json' }
            }
            ))
    }
    const images_responses = await Promise.all(images_requests).then(result => {
        return result.map(res => {
            return getImages(res)
        })
    })
    console.log({ places_images })
    
    res.status(StatusCodes.OK).json({
        // places: responses2
        // places_details: places_details
        // places_images: places_images,
        details: details_responses,
        images: images_responses
    })
}

// response.then(res => {
//     const data = getRestaurant(res)
//     console.log({ rest_data: data })
//     return data
// })
// response.then(res => {
//     const data = getHotel(res)
//     console.log({ rest_data: data })
//     return data
// })

//  (
//     ({
//         name, website, web_url, email, amenities, rating, price_level,
//         address_obj: { address_string }
//     }) => ({
//         name, website, web_url, email, amenities, rating, price_level,
//         address_obj: { address_string }
//     })
// )
//     (res.data);


// (
    //     ({
        //         name, description, website, web_url, email, phone, features, rating,
        //         price_level, cuisine, rating_image_url, num_reviews,
//         address_obj: { address_string }, hours: { weekday_text }
//     }) => ({
//         name, description, website, web_url, email, phone, features, rating,
//         price_level, cuisine, rating_image_url, num_reviews,
//         address_obj: { address_string }, hours: { weekday_text }
//     })
// )
//     (res.data);

        // let places_details = []
        // if (category === 'restaurants') {
        //     places_details = await Promise.all([
        //         axios.get(
        //             `${process.env.trip_adv_loc_end}/${placesIDs[0]}/details?language=en&currency=EGP&key=${process.env.trip_advisor_API_key}`, {
        //             headers: { Accept: 'application/json' }
        //         }
        //         ).then(res => {
        //             const data = getRestaurant(res)
        //             console.log({ rest_data: data })
        //             return data
        //         }),
        //         axios.get(
        //             `${process.env.trip_adv_loc_end}/${placesIDs[1]}/details?language=en&currency=EGP&key=${process.env.trip_advisor_API_key}`, {
        //             headers: { Accept: 'application/json' }
        //         }
        //         ).then(res => {
        //             const data = getRestaurant(res)
        //             console.log({ rest_data: data })
        //             return data
        //         }),
        //         axios.get(
        //             `${process.env.trip_adv_loc_end}/${placesIDs[2]}/details?language=en&currency=EGP&key=${process.env.trip_advisor_API_key}`, {
        //             headers: { Accept: 'application/json' }
        //         }
        //         ).then(res => {
        //             const data = getRestaurant(res)
        //             console.log({ rest_data: data })
        //             return data
        //         })
        //     ])
        // } else {
        //     places_details = await Promise.all([
        //         axios.get(
        //             `${process.env.trip_adv_loc_end}/${placesIDs[0]}/details?language=en&currency=EGP&key=${process.env.trip_advisor_API_key}`, {
        //             headers: { Accept: 'application/json' }
        //         }
        //         ).then(res => {
        //             const data = getHotel(res)
        //             console.log({ hotel_data: data })
        //             return data
        //         }),
        //         axios.get(
        //             `${process.env.trip_adv_loc_end}/${placesIDs[1]}/details?language=en&currency=EGP&key=${process.env.trip_advisor_API_key}`, {
        //             headers: { Accept: 'application/json' }
        //         }
        //         ).then(res => {
        //             const data = getHotel(res)
        //             console.log({ hotel_data: data })
        //             return data
        //         }),
        //         axios.get(
        //             `${process.env.trip_adv_loc_end}/${placesIDs[2]}/details?language=en&currency=EGP&key=${process.env.trip_advisor_API_key}`, {
        //             headers: { Accept: 'application/json' }
        //         }
        //         ).then(res => {
        //             const data = getHotel(res)
        //             console.log({ hotel_data: data })
        //             return data
        //         })
        //     ])
        // }
    
        // console.log({
        //     places_details: places_details
        //     // , places_images: places_images 
        // })


    // let requests = []
    // for (let i = 0; i < placesIDs.length; i++) {
    //     requests.push(
    //         axios.get(
    //             `${process.env.trip_adv_loc_end}/${placesIDs[i]}/photos?language=en&currency=EGP&key=${process.env.trip_advisor_API_key}`, {
    //             headers: { Accept: 'application/json' }
    //         }
    //         ).then(res => {
    //             const images = getImages(res)
    //             console.log({ images: images })
    //             return images
    //         })
    //     )
    // }
    // const responses = await Promise.all(requests)

    // let requests2 = []
    // for (let i = 0; i < placesIDs.length; i++) {
    //     if (category === 'restaurants') {
    //         requests2.push({
    //             imageRequest: axios.get(
    //                 `${process.env.trip_adv_loc_end}/${placesIDs[i]}/photos?language=en&currency=EGP&key=${process.env.trip_advisor_API_key}`, {
    //                 headers: { Accept: 'application/json' }
    //             }
    //             )
    //             // .then(res => {
    //             //     const images = getImages(res)
    //             //     console.log({ images: images })
    //             //     return images
    //             // })
    //             ,
    //             detailsRequest: axios.get(
    //                 `${process.env.trip_adv_loc_end}/${placesIDs[i]}/details?language=en&currency=EGP&key=${process.env.trip_advisor_API_key}`, {
    //                 headers: { Accept: 'application/json' }
    //             }
    //             )
    //             // .then(res => {
    //             //     const data = getRestaurant(res)
    //             //     console.log({ rest_data })
    //             //     return data
    //             // })
    //             ,
    //         })
    //     } else {
    //         requests2.push({
    //             imageRequest: axios.get(
    //                 `${process.env.trip_adv_loc_end}/${placesIDs[i]}/photos?language=en&currency=EGP&key=${process.env.trip_advisor_API_key}`, {
    //                 headers: { Accept: 'application/json' }
    //             }
    //             )
    //             // .then(res => {
    //             //     const images = getImages(res)
    //             //     console.log({ images: images })
    //             //     return images
    //             // })
    //             ,
    //             detailsRequest: axios.get(
    //                 `${process.env.trip_adv_loc_end}/${placesIDs[i]}/details?language=en&currency=EGP&key=${process.env.trip_advisor_API_key}`, {
    //                 headers: { Accept: 'application/json' }
    //             }
    //             )
    //             // .then(res => {
    //             //     const data = getHotel(res)
    //             //     console.log({ rest_data })
    //             //     return data
    //             // })
    //             ,
    //         })
    //     }
    // }
    // const responses2 = await Promise.all(requests2)
    // console.log({
    //     responses: responses2
    // })

    // const places_images = await Promise.all([
    //     axios.get(
    //         `${process.env.trip_adv_loc_end}/${placesIDs[0]}/photos?language=en&currency=EGP&key=${process.env.trip_advisor_API_key}`, {
    //         headers: { Accept: 'application/json' }
    //     }
    //     ).then(res => {
    //         const images = getImages(res)
    //         console.log({ images: images })
    //         return images
    //     }),
    //     axios.get(
    //         `${process.env.trip_adv_loc_end}/${placesIDs[1]}/photos?language=en&currency=EGP&key=${process.env.trip_advisor_API_key}`, {
    //         headers: { Accept: 'application/json' }
    //     }
    //     ).then(res => {
    //         const images = getImages(res)
    //         console.log({ images: images })
    //         return images
    //     }),
    //     axios.get(
    //         `${process.env.trip_adv_loc_end}/${placesIDs[2]}/photos?language=en&currency=EGP&key=${process.env.trip_advisor_API_key}`, {
    //         headers: { Accept: 'application/json' }
    //     }
    //     ).then(res => {
    //         const images = getImages(res)
    //         console.log({ images: images })
    //         return images
    //     })
    // ]) 
    
    //     const places_images = await Promise.all([
    //     axios.get(
    //         `${process.env.trip_adv_loc_end}/${placesIDs[0]}/photos?language=en&currency=EGP&key=${process.env.trip_advisor_API_key}`, {
    //         headers: { Accept: 'application/json' }
    //     }
    //     ).then(res => {
    //         const images = getImages(res)
    //         console.log({ images: images })
    //         return images
    //     }),
    //     axios.get(
    //         `${process.env.trip_adv_loc_end}/${placesIDs[1]}/photos?language=en&currency=EGP&key=${process.env.trip_advisor_API_key}`, {
    //         headers: { Accept: 'application/json' }
    //     }
    //     ).then(res => {
    //         const images = getImages(res)
    //         console.log({ images: images })
    //         return images
    //     }),
    //     axios.get(
    //         `${process.env.trip_adv_loc_end}/${placesIDs[2]}/photos?language=en&currency=EGP&key=${process.env.trip_advisor_API_key}`, {
    //         headers: { Accept: 'application/json' }
    //     }
    //     ).then(res => {
    //         const images = getImages(res)
    //         console.log({ images: images })
    //         return images
    //     })
    // ])