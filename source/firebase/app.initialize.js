import admin from 'firebase-admin'

export const firebaseAdminFunction = function (serviceAccount) {
    const firebaseAdmin = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    })
    console.log("firebase initialized successfully!")
    return firebaseAdmin
}

// import admin_test from 'firebase-admin/messaging'

// const appMessaging = admin_test.getMessaging().subscribeToTopic