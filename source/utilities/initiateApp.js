import DBconnection from "../dataBase/connection.js"
import * as routers from '../modules/index.router.js'
import { GeneralResponse } from "./general.response.js"
import { ReasonPhrases, StatusCodes } from "http-status-codes"
import { getIo, initiateIo } from './ioGeneration.js'
import timeout from 'connect-timeout'
import cors from 'cors'

import { touristModel } from '../dataBase/models/tourist.model.js'
import { tourGuideModel } from '../dataBase/models/tourGuide.model.js'
import { checkUserExists, saveUserSocket } from '../utilities/signUpCheck.js'
import axios from "axios"

// firebase initialization modules :
import { firebaseAdminFunction } from "../firebase/app.initialize.js"

// ES6 doesn't import from JSON files , so we need to get "createRequire"
import { createRequire } from "module"

const require = createRequire(import.meta.url)
const serviceAccount = require("../../graduationproject-f494b-firebase-adminsdk-hb00o-b24cc9c444.json")
let firebaseAdmin

const initiateApp = (app, express) => {
    const port = +process.env.PORT || 5000
    DBconnection()

    firebaseAdmin = firebaseAdminFunction(serviceAccount)

    app.use(express.json()) // for parsing
    app.use(cors()) // for request handling
    // app.use(timeout('15s'))
    // app.use((req, res, next) => {
    //     if (!req.timedout) {
    //         next
    //     } else {
    //         res.status(408).json({
    //             message: "request timed out!"
    //         })
    //     }
    // })
    // app.use((req, res, next) => {
    //     res.setTimeout(500, () => {
    //         res.status(500).json({
    //             message: "request times out!"
    //         })
    //     })
    // })

    app.use('/auth', routers.authRouter)
    app.use('/home', routers.homeRouter)

    app.all('*', (req, res, next) => {
        res.status(StatusCodes.NOT_FOUND).json({
            message: "URL not found! ",
            Reason: ReasonPhrases.NOT_FOUND
        })
    })
    app.use(GeneralResponse)
    const server = app.listen(port, () => {
        console.log(`server is running successfully on port ${port} !`)
    })
    let clients = {}
    const io = initiateIo(server)
    io.on('connection', async (socket) => {
        console.log({
            message: "socket connected!",
            socketId: socket.id,
            socket_handshake_headers: socket.handshake.headers // use this to see "email" in the socket and save the socket id in the data base
        })

        // TODO : discuss the error handling with front-end
        const saveSocketID = await saveUserSocket(socket.handshake.headers.email, socket.id)

        // EDIT : take the email with the connection
        socket.on('signing', async (id) => {
            console.log(id);
            const userData = await checkUserExists(id)
            if (userData.found == true) {
                clients[id] = socket
            }
            clients[id] = socket;
            console.log(clients);
        });
        socket.on("message", async (msg) => {
            console.log(msg);
            const userData = await checkUserExists(msg.source)
            if (userData.found == true) {
                console.log({ message: "source user email is found!" })
                if (clients[msg.source]) {
                    console.log({ message: "source user socket is found!" })
                    // the source exists and valid
                    const destUserData = await checkUserExists(msg.targetId)
                    if (destUserData.found == true) {
                        console.log({ message: "dest user email is found!" })
                        if (clients[msg.targetId]) {
                            console.log({ message: "dest user socket is found!" })
                            clients[msg.targetId].emit("message", msg)
                        }
                    }
                }
            }
        });

        socket.on("error", (error) => {
            console.error("Socket error:", error);
        });
    })
}

export {
    initiateApp,
    firebaseAdmin
} 