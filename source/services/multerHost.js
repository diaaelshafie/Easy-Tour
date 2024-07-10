import multer from 'multer'
import { allowedExtensions } from '../utilities/allowedUploadExtensions.js'
import { customAlphabet } from 'nanoid'

const nanoid = customAlphabet('12345asdfghjlk', 5)

export const multerHostFunction = (extensions = []) => {
    if (!extensions) {
        extensions = allowedExtensions.image
    }
    const multerStorage = multer.diskStorage({})
    const fileUplaod = multer({
        storage: multerStorage,
    })
    return fileUplaod
}

export const multerCallBackVersion = (extensions = []) => {
    return (req, res, next) => {
        if (!extensions) {
            extensions = allowedExtensions.image
        }
        const multerStorage = multer.diskStorage({})
        const fileUplaod = multer({
            storage: multerStorage,
        })
        return fileUplaod
    }
}
// ,
// fileFilter: (req, file, cb) => {
//     if (extensions.includes(file?.mimetype) !== true) {
//         cb(null, false)
//     }
//     cb(null, true)
// }

export const multertempFunction = (extensions = []) => {
    console.log("\nMULTER MIDDLEWARE\n")
    if (!extensions) {
        extensions = allowedExtensions.image
    }
    let tempFileName
    const multerStorage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'temp_images')
            console.log({ message: "destination created successfully!" })
        },
        filename: function (req, file, cb) {
            console.log({
                message: "file",
                file: file
            })
            const unique_name = nanoid()
            tempFileName = unique_name + '_' + file.originalname
            if (file.fieldname === 'syndicateID') {
                req.syndicateFileName = tempFileName
                console.log({
                    message: "syndicate ID unique name and request field added!",
                    unique_file_name: unique_name,
                    added_request_field: req.tempFileName
                })
            } else if (file.fieldname === 'ministryID') {
                req.ministryFileName = tempFileName
                console.log({
                    message: "ministry ID unique name and request field added!",
                    unique_file_name: unique_name,
                    added_request_field: req.ministryFileName
                })
            } else if (file.fieldname === 'CV') {
                req.CVFileName = tempFileName
                console.log({
                    message: "CV unique name and request field added!",
                    unique_file_name: unique_name,
                    added_request_field: req.CVFileName
                })
            } else if (file.fieldname === 'profilePicture') {
                req.profilePictureFileName = tempFileName
                console.log({
                    message: "profilePicture unique name and request field added!",
                    unique_file_name: unique_name,
                    added_request_field: req.profilePictureFileName
                })
            } else {
                req.classImage = tempFileName
                console.log({
                    message: "class image unique name and request field added!",
                    unique_file_name: unique_name,
                    added_request_field: req.classImage
                })
            }
            cb(null, unique_name + '_' + file.originalname)
        }
    })
    const fileUplaod = multer({
        storage: multerStorage,
    })
    console.log("\nMULTER IS FINISHED!\n")
    return fileUplaod
}

// export const multertempFunction2 = (extensions = []) => {
//     console.log("\nMULTER MIDDLEWARE\n")
//     if (!extensions) {
//         extensions = allowedExtensions.image
//     }
//     let tempFileName
//     const multerStorage = multer.diskStorage({
//         destination: function (req, file, cb) {
//             cb(null, 'temp_images')
//             console.log({ message: "destination created successfully!" })
//         },
//         filename: function (req, file, cb) {
//             console.log({
//                 message: "file",
//                 file: file
//             })
//             const unique_name = nanoid()
//             tempFileName = unique_name + '_' + file.originalname
//             req.classImage = tempFileName
//             console.log({
//                 message: "class image unique name and request field added!",
//                 unique_file_name: unique_name,
//                 added_request_field: req.classImage
//             })
//             cb(null, unique_name + '_' + file.originalname)
//         }
//     })
//     const fileUplaod = multer({
//         storage: multerStorage,
//     })
//     console.log("\nMULTER IS FINISHED!\n")
//     return fileUplaod
// }

// ,
// fileFilter: (req, file, cb) => {
//     if (extensions.includes(file?.mimetype) !== true) {
//         cb(null, false)
//     }
//     cb(null, true)
// }

// const fileFilter = (req, file, cb) => {
//     const fileExtension = file.originalname.split('.').pop().toLowerCase();
//     if (!extensions.includes(fileExtension)) {
//         cb(null, false)
//     }
//     cb(null, true)
// }