import { firebaseAdmin } from '../utilities/initiateApp.js'

export const sendPushNotifications = async (devicePushToken, title, body) => {
    await firebaseAdmin.messaging().send({
        token: devicePushToken,
        notification: {
            title,
            body
        }
    })
}