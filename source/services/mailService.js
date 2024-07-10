import nodemailer from 'nodemailer'
import { allowedEmailDomains } from '../utilities/allowedEmailDomains.js'

export const emailService = async ({ message, to, subject } = {}) => {
    const recepient = to.split('@')[1]
    const recepientDomain = recepient.split('.')[0]
    console.log('Recipient Domain:', recepientDomain);
    if (!allowedEmailDomains.includes(recepientDomain)) {
        console.log('Rejected Email Domain:', recepientDomain);
        return false
    }
    const transporter = nodemailer.createTransport({
        host: process.env.Host_URL_OR_DNS,
        port: 465, // since the serevr (cloud host should support secure layer TLS or SSL) if not -> 587
        secure: true,
        auth: {
            user: 'gradproject89@gmail.com',
            pass: 'ulqd hqcv wljo hpry'
        },
        tls: {
            rejectUnauthorized: true,
            // servername: process.env.HOST_SERVER_NAME
            // path: process.env.TLS_CERTIFICATE_PATH // -> server , service ?
        },
        service: 'gmail'
    })
    const sendEmail = await transporter.sendMail({
        to: to ? to : '',
        from: `"Land Of Pharaohs" <gradproject89@gmail.com>`,
        subject: subject ? subject : '',
        html: message ? message : ''
    })
    console.log({
        'Message : ': sendEmail
    })
    if (sendEmail.accepted.length) {
        return true
    }
    return false
}