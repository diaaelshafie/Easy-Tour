import cloudinary from "../services/cloudinary.js"

export const deleteAsset = async (public_id, folderPath) => {
    const signs = {
        deleted: false,
        notFound: false
    }
    try {
        try {
            await cloudinary.api.resource(public_id)
            console.log({ message: "asset is found!" })
            await cloudinary.uploader.destroy(public_id)
            console.log({ message: "asset is deleted" })
        } catch (error) {
            signs.notFound = true
        }
        try {
            await cloudinary.api.delete_folder(folderPath)
            console.log({ message: "asset folder is deleted" })
            signs.deleted = true
            return signs
        } catch (error) {
            console.log({ error })
        }
    } catch (error) {
        console.log({ message: "failed to delete the asset", error: error })
        signs.deleted = false
        return signs
    }
}

export const deleteFolder = async (folderPath) => {
    try {
        await cloudinary.api.delete_folder(folderPath)
        console.log({ message: "user folder is deleted successfully!" })
    } catch (error) {
        console.log({
            api_error_message: "failed to delete the user folder , requires deletion later",
            error: error
        })
    }
}

export const restoreAsset = async (public_id, folderPath) => {
    try {
        await cloudinary.api.create_folder(folderPath, { resource_type: 'raw' })
        console.log({ message: "folder is recreated!" })
        await cloudinary.api.restore([public_id])
        console.log({ message: "asset is restored" })
        return true
    } catch (error) {
        console.log({ message: "failed to restore the asset", error: error })
        return false
    }
}

export const restoreAssetPromise = async (public_id, folderPath) => {
    return new Promise((resolve, reject) => {
        cloudinary.api.create_folder(folderPath, { resource_type: 'raw' })
        cloudinary.api.restore([public_id])
    })
}