import {
    historicMP_Model, cloudinary, customAlphabet, deleteAsset, deleteFolder,
    restoreAsset, restoreAssetPromise, ReasonPhrases, StatusCodes, cloudMedia_subFolders
} from './controller.imports.js'

const nanoid = customAlphabet('asdqwezxcbnmjkl_#$', 5)

export const getAllPlacesData = async (req, res, next) => {
    console.log("\nSTATIC GET ALL HISTORIC PLACES API\n")
    const { type } = req.body

    let getData
    try {
        getData = await historicMP_Model.find()
        console.log({
            message: "data is found!",
            data: getData
        })
    } catch (error) {
        console.log({
            error_message: "failed to find the data!",
            error: error
        })
        return next(new Error("data is not found!", { cause: StatusCodes.BAD_REQUEST }))
    }

    console.log("\nSTATIC GET ALL HISTORIC PLACES API DONE\n")
    res.status(StatusCodes.OK).json({
        message: "data is found!",
        data: getData,
        data_length: getData.length
    })
}

export const placeToggleFav = async (req, res, next) => {
    console.log("\nTOURIST TOGGLE TO FAVs API\n")
    // this API will either add the place to the favourites or remove it from it
    const { placeName } = req.body

    // check if the place is in the model or not
    const getPlace = await historicMP_Model.findOne({ name: placeName })
    if (!getPlace) {
        console.log({ user_error_message: "place doesn't exist" })
        return next(new Error("place doesn't exist", { cause: StatusCodes.BAD_REQUEST }))
    }
    if (getPlace.errors) {
        console.log({ api_error_message: "internal error finding the place" })
        return next(new Error("internal error finding the place", { cause: StatusCodes.INTERNAL_SERVER_ERROR }))
    }
    console.log({
        message: "place is found!",
        place_data: getPlace
    })

    // if the user has a favouriteHistoricPlaces from the first place :
    if (req.authUser.favouriteHistoricPlaces) {
        // if the place was already in the tourist's favourits -> remove it
        if (req.authUser.favouriteHistoricPlaces.includes(getPlace._id)) {
            console.log({ message: "place is in user favs, removing it..." })
            req.authUser.favouriteHistoricPlaces = req.authUser.favouriteHistoricPlaces.filter(placeId => placeId.toString() !== getPlace._id.toString())
            console.log({ message: "place is removed from the favourites" })
        }
        // if the place is not in the user favs -> add it
        else if (!req.authUser.favouriteHistoricPlaces.includes(getPlace._id)) {
            console.log({ message: "place is not in the user favs , adding it..." })
            req.authUser.favouriteHistoricPlaces.push(getPlace._id)
            console.log({ message: "place added to the user favs successfully" })
        }
    } else { // if the user had no favouriteHistoricPlaces field -> add one in it
        console.log({ message: "user had no place in his favs , adding one..." })
        req.authUser.favouriteHistoricPlaces.push(getPlace._id)
        console.log({ message: "place added to the user favs successfully" })
    }

    try {
        await req.authUser.save()
        console.log({ message: "user updates are saved successfully!" })
    } catch (error) {
        console.log({
            error_message: "failed to save user updates!",
            error: error
        })
        return next(new Error(`failed to save user updates! , ${error}`, { cause: StatusCodes.INTERNAL_SERVER_ERROR }))
    }

    console.log("\n\nTOURIST TOGGLE TO FAVs API DONE\n")
    res.status(StatusCodes.OK).json({
        message: "user favourites are updated!",
        favourites: req.authUser.favouriteHistoricPlaces
    })
}

export const addData = async (req, res, next) => {
    console.log("\nSTATIC ADD HISTORIC PLACE API!\n")

    const { name, type, location, details, ticket_price } = req.body

    const isUnique = await historicMP_Model.findOne({ name })
    if (isUnique) {
        console.log({
            user_error_message: "user entered an existing name",
            entered_name: name,
            existing_document: isUnique
        })
        return next(new Error('name already exists! , you must enter a unique name!', { cause: StatusCodes.BAD_REQUEST }))
    }
    console.log({ message: "name is valid!" })

    if (type !== 'monument' && type !== 'islamic') {
        console.log({ message: "place type isn't valid" })
        return next(new Error(`the place type must be either : 'monument' , 'islamic' , 'nearby' ,  but got ${type}`, { cause: StatusCodes.BAD_REQUEST }))
    }

    if (ticket_price < 0) {
        console.log({
            user_error_message: "user entered a number less than zero!",
            entered_number: ticket_price
        })
        return next(new Error(`ticket prices can't be less than zero , the price you entered was : ${ticket_price}`,
            { cause: StatusCodes.BAD_REQUEST }
        ))
    }
    console.log({ message: "ticket price is valid!" })

    const customId = nanoid()
    if (!req.file) {
        console.log({ user_error_message: "the request must contain an image for the place!" })
        return next(new Error("you must insert an image for the place!", { cause: StatusCodes.BAD_REQUEST }))
    }
    let image
    try {
        image = await cloudinary.uploader.upload(req.file.path, {
            folder: `${process.env.PROJECT_UPLOADS_FOLDER}/${cloudMedia_subFolders.static_historicMP}/${customId}`
        })
        console.log({ message: 'asset is uploaded successfully!' })
    } catch (error) {
        console.log({
            api_error_message: "failed to upload the asset!",
            error: error
        })
        return next(new Error("failed to upload the asset!", { cause: StatusCodes.INTERNAL_SERVER_ERROR }))
    }
    req.static_historic_publicId = image.public_id

    const data = {
        name,
        type,
        location,
        details,
        ticket_price,
        image: {
            secure_url: image.secure_url,
            public_id: image.public_id
        },
        customId
    }

    let saveData
    try {
        saveData = await historicMP_Model.create(data)
        console.log({
            message: "data added successfully!",
            data: saveData
        })
    } catch (error) {
        console.log({
            api_error_message: "error while saving the data in the database!",
            error: error
        })
        return next(new Error("couldn't save the data in the database!", { cause: StatusCodes.INTERNAL_SERVER_ERROR }))
    }

    console.log("\nSTATIC ADD HISTORIC PLACE API DONE!\n")
    res.status(StatusCodes.CREATED).json({
        message: 'the historic place has been created',
        added_place: saveData
    })
}

export const editData = async (req, res, next) => {
    console.log("\nSTATIC EDIT HISTORIC PLACE API!\n")

    // you can't change the name since it's unique and it's a monument!
    const { name, type, location, details, ticket_price } = req.body

    const getData = await historicMP_Model.findOne({ name })
    if (!getData) {
        console.log({
            user_error_message: "place is not found!"
        })
        return next(new Error("place is not found!", { cause: StatusCodes.BAD_REQUEST }))
    }
    if (getData?.errors) {
        console.log({
            api_error_message: "error in finding the place data!",
            errors: getData?.errors
        })
        return next(new Error("error in finding the place!", { cause: StatusCodes.INTERNAL_SERVER_ERROR }))
    }
    console.log({
        message: "place data is found!",
        data: getData
    })

    if (type) {
        if (type !== 'monument' && type !== 'islamic') {
            console.log({ message: "place type isn't valid" })
            return next(new Error(`the place type must be either : 'monument' , 'islamic' , 'nearby' ,  but got ${type}`, { cause: StatusCodes.BAD_REQUEST }))
        }
        getData.type = type
        console.log({ message: "place type is updated!" })
    }

    if (details) {
        getData.set('details', details)
        console.log({ message: "details are updated!" })
    }

    if (location) {
        getData.set('location.longitude', location.longitude)
        getData.set('location.latitude', location.latitude)
        console.log({ message: "location is updated!" })
    }

    if (ticket_price) {
        if (ticket_price < 0) {
            console.log({
                user_error_message: "user entered a number less than zero!",
                entered_number: ticket_price
            })
            return next(new Error(`ticket prices can't be less than zero , the price you entered was : ${ticket_price}`,
                { cause: StatusCodes.BAD_REQUEST }
            ))
        }
        getData.set('ticket_price', ticket_price)
        console.log({ message: "ticket price is updated!" })
    }

    let imagePath
    if (req.file) {
        // images must be there already wether you want to update them or not
        let updatedImage
        imagePath = `${process.env.PROJECT_UPLOADS_FOLDER}/${cloudMedia_subFolders.static_historicMP}/${getData.customId}`
        console.log({ message: "place had an image!" })
        try {
            updatedImage = await cloudinary.uploader.upload(req.file.path, {
                // don't use the folder parameter here as it will create another path inside the existing path as the parameter 'public_id' automatically navigates to the existing path
                public_id: `${getData.image?.public_id}`, // no need for using "folder" field as this one navgate to it automatically
                overwrite: true,
                invalidate: true // this purges (delete) the existing old image 
            })
            getData.image.secure_url = updatedImage.secure_url
            getData.image.public_id = updatedImage.public_id
            console.log({
                message: "image is updated!"
            })
        } catch (error) {
            console.log({
                message: "error while updating the image!",
                error: error
            })
            return next(new Error("failed to update the image!", { cause: StatusCodes.INTERNAL_SERVER_ERROR }))
        }
    }

    try {
        await getData.save()
        console.log({
            message: "place data is updated!",
            place_after_update: getData
        })
    } catch (error) {
        console.log({
            message: "failed to update the data in the database!",
            error: error
        })
    }

    console.log("\nSTATIC EDIT HISTORIC PLACE API DONE!\n")
    res.status(StatusCodes.OK).json({
        message: "place update is successfull!",
        place: getData
    })
}

// deprecated
export const getPlaceData = async (req, res, next) => {
    console.log("\nSTATIC GET HISTORIC PLACE API!\n")

    const { name } = req.body

    const getData = await historicMP_Model.findOne({ name })
    if (getData?.errors) {
        console.log({
            error_message: "failed to find the place data!",
            errors: getData?.errors
        })
        return next(new Error("place is not found!", { cause: StatusCodes.BAD_REQUEST }))
    }
    console.log({
        message: "place data is found!",
        data: getData
    })

    console.log("\nSTATIC GET HISTORIC PLACE API DONE!\n")
    res.status(StatusCodes.OK).json({
        message: "place data is found!",
        data: getData
    })
}

// deprecated
export const getAllPlaces = async (req, res, next) => {
    console.log("\nSTATIC GET ALL HISTORIC PLACES API\n")

    let getData
    try {
        getData = await historicMP_Model.find().select('name image.secure_url')
        console.log({
            message: "data is found!",
            data: getData
        })
    } catch (error) {
        console.log({
            error_message: "failed to find the data!",
            error: error
        })
        return next(new Error("data is not found!", { cause: StatusCodes.BAD_REQUEST }))
    }

    console.log("\nSTATIC GET ALL HISTORIC PLACES API DONE\n")
    res.status(StatusCodes.OK).json({
        message: "data is found!",
        data: getData,
        data_length: getData.length
    })
}

export const deletePlace = async (req, res, next) => {
    console.log("\nSTATIC DELETE HISTORIC PLACE API\n")
    const { name } = req.body
    console.log({ type_of_name: typeof (name) })
    let deleteData
    if (typeof (name) === 'string') {
        console.log({ name_type: typeof (name) })
        const getData = await historicMP_Model.findOne({ name })
        if (!getData) {
            console.log({ message: "place is not found!" })
            return next(new Error("place is not found!", { cause: StatusCodes.BAD_REQUEST }))
        }
        if (getData?.errors) {
            console.log({ message: "failed to find the place!" })
            return next(new Error("the place does not exist!", { cause: StatusCodes.BAD_REQUEST }))
        }
        console.log({ message: "place is found!", place: getData })
        try {
            deleteData = await historicMP_Model.deleteOne({ name })
            console.log({ message: "place is deleted!" })
        } catch (error) {
            log({
                error_message: "failed to delete the place",
                error: error
            })
            return next(new Error("failed to delete the place!", { cause: StatusCodes.INTERNAL_SERVER_ERROR }))
        }
        let imagePath = `${process.env.PROJECT_UPLOADS_FOLDER}/${cloudMedia_subFolders.static_historicMP}/${getData.customId}`
        const deletedImage = await deleteAsset(getData.image.public_id, imagePath)
        if (deletedImage.notFound === true) {
            console.log({ message: "image didn't exist!" })
        } else if (deletedImage.deleted === false) {
            console.log({ message: "failed to delete the image!" })
            return next(new Error("failed to delete the image!", { cause: StatusCodes.INTERNAL_SERVER_ERROR }))
        }
    } else if (Array.isArray(name) === true) {
        console.log({ name_is_array: Array.isArray(name) })
        const getData = await historicMP_Model.find({
            name: { $in: name }
        }).select('customId image')
        if (!getData.length) {
            console.log({ message: "none of the places entered was found!" })
            return next(new Error("none of the places entered was found!", { cause: StatusCodes.BAD_REQUEST }))
        }
        if (!getData) {
            console.log({ message: "failed to find the places!" })
            return next(new Error("the places does not exist!", { cause: StatusCodes.BAD_REQUEST }))
        }
        console.log({ message: "places are found!", places: getData })
        try {
            deleteData = await historicMP_Model.deleteMany({
                name: { $in: name }
            })
            console.log({ message: "places are deleted!" })
        } catch (error) {
            console.log({
                error_message: "failed to delete places!",
                error: error
            })
            return next(new Error("failed to delete the places!", { cause: StatusCodes.INTERNAL_SERVER_ERROR }))
        }
        let imagePaths = [], public_ids = []
        for (const place of getData) {
            imagePaths.push(`${process.env.PROJECT_UPLOADS_FOLDER}/${cloudMedia_subFolders.static_historicMP}/${place.customId}`)
            public_ids.push(place.image.public_id)
        }
        try {
            await cloudinary.api.delete_resources(public_ids)
            console.log({ message: "all resources are deleted!" })
        } catch (error) {
            console.log({ message: "failed to delete resources!", error: error })
            return next(new Error("failed to delete resources , required manual deletion!", { cause: StatusCodes.INTERNAL_SERVER_ERROR }))
        }
        for (let i = 0; i < imagePaths.length; i++) {
            await deleteFolder(imagePaths[i])
        }
    } else {
        console.log({ user_error_message: "name variable must be either a string or an array" })
        return next(new Error("the input must be either a string or an array!", { cause: StatusCodes.BAD_REQUEST }))
    }

    console.log("\nSTATIC DELETE HISTORIC PLACE API DONE!\n")
    res.status(StatusCodes.OK).json({
        message: "place(s) deleted successfully!",
        deleted_places: deleteData
    })
}