import {
    bcrypt, chatModel, tourGuideModel, touristModel, moment, momentTZ, StatusCodes, getIo, statuses
} from './controller.imports.js'

export const MomentTest = async (req, res, next) => {
    const { testDate } = req.body


    const nowTime = Date.now()
    const inputTime = Date.parse(testDate)
    res.json({
        Now: nowTime,
        input: inputTime,
        now_type: typeof (nowTime),
        input_type: typeof (inputTime),
        isInputInFuture: inputTime > nowTime,
        isInputInPast: inputTime < nowTime
    })


    // const DateStringVariable = Date.parse('2024-07-01')
    // const DateLocalVariable = Date.now().valueOf()
    // const DateExpoVariable = Date.now().toExponential()
    // const DatePrecisionVariable = Date.now().toPrecision()
    // const DateFixedVariable = Date.now().toFixed()
    // // const nowTime = moment.isDate(moment.now())
    // console.log({
    //     // nowTime: nowTime,
    //     string_time: DateStringVariable,
    //     local_time: DateLocalVariable,
    //     expo_time: DateExpoVariable,
    //     precision_time: DatePrecisionVariable,
    //     fixed_time: DateFixedVariable
    // })
    // console.warn({
    //     // nowTime: nowTime,
    //     string_time: DateStringVariable,
    //     local_time: DateLocalVariable,
    //     expo_time: DateExpoVariable,
    //     precision_time: DatePrecisionVariable,
    //     fixed_time: DateFixedVariable
    // })
    // console.error({
    //     // nowTime: nowTime,
    //     string_time: DateStringVariable,
    //     local_time: DateLocalVariable,
    //     expo_time: DateExpoVariable,
    //     precision_time: DatePrecisionVariable,
    //     fixed_time: DateFixedVariable
    // })
    // res.json({
    //     string_time: DateStringVariable,
    //     local_time: DateLocalVariable,
    //     expo_time: DateExpoVariable,
    //     precision_time: DatePrecisionVariable,
    //     fixed_time: DateFixedVariable
    //     // currentTime: nowTime
    // })
}

export const AddChatManually = async (req, res, next) => {
    const {
        POne, PTwo, messages
    } = req.body
    const newChat = chatModel.create({
        POne, PTwo, messages
    })
    res.json({ message: 'done' })
}

export const getRecentChats = async (req, res, next) => {
    console.log("\nGET RECENT CHATS\n")
    const user = req.authUser
    const getAllAssocChats = await chatModel.find({
        $or: [
            { 'POne.ID': user._id },
            { 'PTwo.ID': user._id }
        ],
    }).select('-POne.ID -PTwo.ID').sort({ lastDate: -1 })
    if (getAllAssocChats.length == null || getAllAssocChats.length == 0) {
        console.log({ message: "the user has no chats" })
        return res.status(StatusCodes.NO_CONTENT).json() // 204
    }
    console.log({ getAllAssocChats })

    let result = getAllAssocChats
    console.log({ chats: result })
    result.forEach((chat) => {
        // i want to send only the last message
        if (chat.messages.length > 0) {
            chat.messages = chat.messages.at(-1)
        }
        // i want to null the meta data of the auth User and leave the meta data of his versus chat participant , so i check which one the request user is and i null him
        if (chat.POne.email === user.email) {
            chat.POne.email = null
        } else {
            chat.PTwo.email = null
        }
    })
    console.log({ chats_after_editing: result })

    console.log("\nGET RECENT CHATS IS DONE\n")
    return res.status(StatusCodes.OK).json({
        message: "chats found!",
        chats: result
    })
}

export const getChat = async (req, res, next) => {
    console.log("\nGET CHAT API\n")
    const user = req.authUser
    const { chatid } = req.headers // database ID
    console.log({
        request_body: req.body,
        chatid: req.body.chatid,
        headers: req.headers
    })

    const getChat = await chatModel.findOne({
        $and: [
            { _id: chatid },
            {
                $or: [
                    { 'POne.ID': user._id },
                    { 'PTwo.ID': user._id }
                ]
            }
        ]
    }).select('-POne.ID -PTwo.ID')

    if (!getChat) {
        console.log({ error_message: "either the chat doesn't include the user or the chat doesn't exist" })
        return next(new Error("either the chat doesn't include the user or the chat doesn't exist", { cause: StatusCodes.BAD_REQUEST }))
    }
    console.log({ message: "chat found", found_chat: getChat })

    console.log("\nGET CHAT API IS DONE!\n")
    res.status(StatusCodes.OK).json({
        message: "chat is found!",
        chat: getChat
    })
}
// { $eq: ["POne.ID", "_id"] },
// { $eq: ["PTwo.ID", "_id"] }

// .populate([{
//     path: 'chats',
//     match: {
//         $expr: {
//             $or: [
//                 {
//                     $and: [
//                         { $eq: ["$POne.ID", "$_id"] },
//                         { $eq: ["$PTwo.ID", user._id] }
//                     ],
//                     $and: [
//                         { $eq: ["$POne.ID", user._id] },
//                         { $eq: ["PTwo.ID", "$_id"] }
//                     ]
//                 }
//             ]
//         }
//     },
//     select: '_id'
// }])

// let result = []
// // getTGs.map((doc) => doc.toObject())
// getTGs.forEach((doc) => result.push(doc.toObject()))

// result.forEach(async (tourGuide) => {
//     const getChats = await chatModel.find({
//         $or: [
//             {
//                 $and: [
//                     { 'POne.email': tourGuide.email },
//                     { 'PTwo.email': user.email }
//                 ]
//             },
//             {
//                 $and: [
//                     { 'POne.email': user.email },
//                     { 'PTwo.email': tourGuide.email }
//                 ]
//             }
//         ]
//     }).select('_id')
//     console.log({
//         TG_email: tourGuide.email,
//         chats: getChats
//     })
//     tourGuide.chats = getChats
// })
export const getTGMeta = async (req, res, next) => {
    console.log("\nGET TG META API\n")
    const user = req.authUser
    const getTGs = await tourGuideModel.find()
        .select('-_id firstName profilePicture.secure_url status email chats')

    if (!getTGs) {
        console.log({
            message: "no tour guides were found!"
        })
        return next(new Error('no tour guides were found!', { cause: StatusCodes.INTERNAL_SERVER_ERROR }))
    }
    console.log({ message: "TourGuides are found", TG_meta: getTGs })


    const result = await Promise.all(getTGs.map(async (tourGuide) => {
        const getChats = await chatModel.find({
            $or: [
                {
                    $and: [
                        { 'POne.email': tourGuide.email },
                        { 'PTwo.email': user.email }
                    ]
                },
                {
                    $and: [
                        { 'POne.email': user.email },
                        { 'PTwo.email': tourGuide.email }
                    ]
                }
            ]
        }).select('_id')

        console.log({
            TG_email: tourGuide.email,
            chats: getChats
        })

        tourGuide.chats = getChats
        return tourGuide.toObject() // Convert to plain object
    }))

    console.log("\nGET TG META API IS DONE!\n")
    res.status(200).json({
        message: "tour guides meta data found",
        tourGuides: result
    })
}

export const sendMessage = async (req, res, next) => {
    console.log("\nSEND MESSAGE API\n")
    // TODO : change later to Email instead of _id in the model and the get APIs
    const { _id, email } = req.authUser // sender
    const { destEmail, message, messageType } = req.body
    let getChat = await chatModel.findOne({
        $or: [
            {
                $and: [
                    { 'POne.email': email },
                    { 'PTwo.email': destEmail }
                ]
            },
            {
                $and: [
                    { 'POne.email': destEmail },
                    { 'PTwo.email': email }
                ]
            }
        ]
    })

    const secondParticipant = await Promise.all([
        touristModel.findOne({ email: destEmail }),
        tourGuideModel.findOne({ email: destEmail })
    ])
    let secondPId
    if (secondParticipant[0]) {
        secondPId = secondParticipant[0]._id
    } else {
        secondPId = secondParticipant[1]._id
    }

    if (!getChat) {
        console.log({ message: "chat is not found!" })
        // create a new chat
        let newChatData = {
            POne: {
                ID: _id
            },
            PTwo: {
                ID: secondPId
            },
            messages: [
                {
                    from: email,
                    to: destEmail,
                    message: message,
                    date: Date.now(),
                    type: messageType
                }
            ]
        }
        getChat = await chatModel.create(newChatData).then(() => console.log({ message: "new chat is created!" }))
        newChatData = null
    }

    console.log({
        message: "chat is found!",
        chat: getChat
    })

    const getReceiver = await Promise.all([
        touristModel.findOne({ email: destEmail }),
        tourGuideModel.findOne({ email: destEmail })
    ])

    let receiverSocket
    if (getReceiver[0]) {
        if (getReceiver[0].socketID !== null && getReceiver[0].status === statuses.online) {
            receiverSocket = getReceiver[0].socketID
        } else {
            console.log({ error_message: "user either has no socketID or he is not online!" })
            return next(new Error("user either has no socketID or he is not online!", { cause: StatusCodes.INTERNAL_SERVER_ERROR }))
        }
    } else if (getReceiver[1]) {
        if (getReceiver[1].socketID !== null && getReceiver[1].status === statuses.online) {
            receiverSocket = getReceiver[1].socketID
        } else {
            console.log({ error_message: "user either has no socketID or he is not online!" })
            return next(new Error("user either has no socketID or he is not online!", { cause: StatusCodes.INTERNAL_SERVER_ERROR }))
        }
    }

    const messageData = {
        from: email,
        to: destEmail,
        message: message,
        date: Date.now(),
        type: messageType
    }

    getChat.messages.push(messageData)
    console.log({ new_chat_messages: getChat.messages })
    await getChat.save()
    console.log({ message: "message is saved in database!", new_chat_messages: getChat.messages })

    console.log({ message_before: messageData })
    getIo().to(receiverSocket).emit('receiveMessage', messageData)
    console.log({ message_after: messageData })
    console.log({ message: "message is sent by socketing" })
    console.log("\nSEND MESSAGE API IS DONE!\n")
    res.status(200).json({
        message: "message sent"
    })
}