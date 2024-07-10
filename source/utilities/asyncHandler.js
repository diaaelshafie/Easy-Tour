import cloudinary from "../services/cloudinary.js"
import { TourGuideTripsModel } from '../dataBase/models/tourGuideTrips.model.js'

export const asyncHandler = (API) => { // API -> api controller 
    return (req, res, next) => {
        // API is already async and it is a function
        API(req, res, next)
            .catch(async (err) => {
                console.log("\nASYNC HANDLER!\n")
                console.log({
                    async_handler_err: err,
                    async_handler_message: err?.message
                })
                // if (req.deletedTrip) { // NOTE : it is not good at all to pass a database document here in my opinion
                //     try {
                //         let retrievedTrip = await TourGuideTripsModel.create(req.deletedTrip)
                //         console.log({
                //             async_handler_message: `Deleted Trip was successfully retrieved`,
                //             retrievedTrip
                //         })
                //         retrievedTrip = null
                //     } catch (error) {
                //         console.log({
                //             async_handler_message: "failed to retrieve the deleted trip!",
                //             error: error
                //         })
                //     }
                // }
                if (req?.coverImgPath) {
                    console.log({
                        async_handler_message: "cover image path is passed here!",
                        cover_image_path: req?.coverImgPath
                    })
                    await cloudinary.api.delete_resources_by_prefix(req.coverImgPath)
                    await cloudinary.api.delete_folder(req.coverImgPath)
                    console.log({
                        async_handler_message: "cover image is deleted!"
                    })
                }
                if (req?.profileImgPath) {
                    console.log({
                        async_handler_message: "profile image path is passed here!",
                        profile_image_path: req?.profileImgPath
                    })
                    await cloudinary.api.delete_resources_by_prefix(req.profileImgPath)
                    await cloudinary.api.delete_folder(req.profileImgPath)
                    console.log({
                        async_handler_message: "profile image is deleted!"
                    })
                }
                if (req?.ministryLiscenceImgPath) {
                    console.log({
                        async_handler_message: "ministry liscence image path is passed here!",
                        ministry_liscence_image_path: req?.ministryLiscenceImgPath
                    })
                    await cloudinary.api.delete_resources_by_prefix(req.ministryLiscenceImgPath)
                    await cloudinary.api.delete_folder(req.ministryLiscenceImgPath)
                    console.log({
                        async_handler_message: "ministry liscence image is deleted!"
                    })
                }
                if (req?.syndicateLiscenceImgPath) {
                    console.log({
                        async_handler_message: "syndicate liscence image path is passed here!",
                        ministry_liscence_image_path: req?.syndicateLiscenceImgPath
                    })
                    await cloudinary.api.delete_resources_by_prefix(req.syndicateLiscenceImgPath)
                    await cloudinary.api.delete_folder(req.syndicateLiscenceImgPath)
                    console.log({
                        async_handler_message: "syndicate liscence image is deleted!"
                    })
                }
                if (req?.CvfilePath) {
                    console.log({
                        async_handler_message: "CV file path is passed here!",
                        ministry_liscence_image_path: req?.CvfilePath
                    })
                    await cloudinary.api.delete_resources_by_prefix(req.CvfilePath)
                    await cloudinary.api.delete_folder(req.CvfilePath)
                    console.log({
                        async_handler_message: "CV file is deleted!"
                    })
                }
                if (req.profilePictureFileName || req.CVFileName || req.ministryFileName || req.syndicateFileName) {
                    try {
                        const temp_folder_files = await fsPromise.readdir(process.env.LOCAL_TEMP_UPLOADS_PATH)
                        await Promise.all(temp_folder_files.map(async (file) => {
                            const filePath = path.join(process.env.LOCAL_TEMP_UPLOADS_PATH, file)
                            await fsPromise.unlink(filePath)
                        }))
                        console.log({
                            message: `folder ${process.env.LOCAL_TEMP_UPLOADS_PATH} is emptied successfully!`
                        })
                    } catch (error) {
                        console.log({
                            message: `failed to empty the folder ${process.env.LOCAL_TEMP_UPLOADS_PATH}`
                        })
                    }
                }
                if (err.message === 'TourGuide validation failed: email: Path `email` is required.') {
                    console.log({
                        async_handler_message: 'Handling email validation error...',
                    });
                    return res.status(400).json({ error: 'Email is required.' });
                }
                if (err === 'Invalid login: 454-4.7.0 Cannot authenticate due to temporary system problem. Try again later.') {
                    console.log({
                        async_handler_message: "email service failure!",
                        async_handler_err: err
                    })
                }
                if (err.message === 'Request failed with status code 400') {
                    console.log({
                        axios_response: err.response.data.error
                    })
                }
                // AxiosError: 
                if (err.message === 'Request failed with status code 500') {
                    console.log({
                        axios_response: err.response.data
                    })
                }
                // AxiosError: 
                if (err.message === 'Request failed with status code 429') {
                    console.log({
                        axios_response: err.response.data
                    })
                }
                console.log("\nASYNC HANDLER FINISHED!\n")
                return next(new Error(`API failed to run !\nerror: ${err} \ncause: ${err.message}`, { cause: 500 }))
            })
    }
}

// unhandled errors

// Error: Invalid login: 454-4.7.0 Cannot authenticate due to temporary system problem. Try again later.
// 454-4.7.0 For more information, go to
// 454 4.7.0  https://support.google.com/a/answer/3221692 oj15-20020a056214440f00b0068cbde0af0fsm1170841qvb.16 - gsmtp
//     at SMTPConnection._formatError (/app/node_modules/nodemailer/lib/smtp-connection/index.js:790:19)
//     at SMTPConnection._actionAUTHComplete (/app/node_modules/nodemailer/lib/smtp-connection/index.js:1564:34)
//     at SMTPConnection.<anonymous> (/app/node_modules/nodemailer/lib/smtp-connection/index.js:546:26)
//     at SMTPConnection._processResponse (/app/node_modules/nodemailer/lib/smtp-connection/index.js:969:20)
//     at SMTPConnection._onData (/app/node_modules/nodemailer/lib/smtp-connection/index.js:755:14)
//     at SMTPConnection._onSocketData (/app/node_modules/nodemailer/lib/smtp-connection/index.js:193:44)
//     at TLSSocket.emit (node:events:519:28)
//     at addChunk (node:internal/streams/readable:559:12)
//     at readableAddChunkPushByteMode (node:internal/streams/readable:510:3)
//     at Readable.push (node:internal/streams/readable:390:5) {
//   code: 'EAUTH',
//   response: '454-4.7.0 Cannot authenticate due to temporary system problem. Try again later.\n' +
//     '454-4.7.0 For more information, go to\n' +
//     '454 4.7.0  https://support.google.com/a/answer/3221692 oj15-20020a056214440f00b0068cbde0af0fsm1170841qvb.16 - gsmtp',
//   responseCode: 454,
//   command: 'AUTH PLAIN'
// }