import {
    StatusCodes, bcrypt, cloudinary,
    customAlphabet, emailService, generateToken, slugify, statuses, systemRoles, verifyToken,
    touristModel, ReasonPhrases, checkUserExists, OAuth2Client, socialProviders
} from './controller.imports.js'

// for tourist sign up :
const nanoid = customAlphabet('asdfghjkl123456789_#$%!', 5)
// for password reset :
const nanoid2 = customAlphabet('1234567890', 6)

// TODO : edit all APIs' responses (what you show for the front) , status codes , reasonPhrases
// TODO : change the database URL after testing
// TODO : find a two-way encryption module that can be used in both node.js + flutter

export const TouristSignUp = async (req, res, next) => {

    console.log("\nTOURIST SIGN UP API\n")

    const {
        userName, email, password, confirmPassword
    } = req.body

    const findUser = await checkUserExists(email)
    console.log({ foundUser: findUser })
    if (findUser.found == true) {
        return next(new Error(`${findUser.message}`, { cause: StatusCodes.BAD_REQUEST }))
    }
    console.log({ message: findUser.message, is_user_found: findUser.found })

    const slug = slugify(userName, '_')
    console.log({
        message: "slugging done!",
        plain_name: userName,
        sluggified_name: slug
    })

    const userData = {
        userName,
        email,
        slug,
        // address
    }
    console.log({
        message: "email , userName and slug are done!"
    })

    const hashedPassword = bcrypt.hashSync(password, +process.env.SIGN_UP_SALT_ROUNDS)
    userData.password = hashedPassword
    console.log({
        message: "password encryption done!",
    })

    const saveUser = await touristModel.create(userData)
    if (!saveUser) {
        console.log({
            api_error_message: "couldn't save the user in the data base , SERVER ERROR"
        })
        await cloudinary.uploader.destroy(profilePic?.public_id)
        await cloudinary.uploader.destroy(coverPic?.public_id)
        return next(new Error("couldn't save the user in the data base !", { cause: 500 }))
    }

    // const token = generateToken({
    //     expiresIn: '1d',
    //     signature: process.env.LOGIN_SECRET_KEY,
    //     payload: {
    //         email: saveUser.email,
    //         userName: saveUser.userName,
    //         role: systemRoles.tourist
    //     }
    // })
    // console.log({ message: "user token generated!" })

    // saveUser.token = token
    // saveUser.status = statuses.online
    // await saveUser.save()
    // console.log({ message: "user saved!" })

    const confirmToken = generateToken({ payload: { email }, signature: process.env.CONFIRM_LINK_SECRETE_KEY, expiresIn: '1h' })
    // `${req.protocol}://${req.headers.host}:${process.env.PORT}/user/confirmEmail/${EmailConfirmToken}`
    console.log({ message: "account confirmation token generated!" })

    // TODO : you might add a '/' before 'confirmToken'
    console.log(`req destination host:${req.headers.host}`)
    const confirmLink = `${req.protocol}://${req.headers.host}/${process.env.tourist_auth_confirm_account_endpoint}${confirmToken}`
    const message = `<a href = ${confirmLink} >PLEASE USE THIS LINK TO CONFIRM YOUR EMAIL !</a>`
    const subject = 'Email confirmation'
    const sendEMail = emailService({ message, to: email, subject })
    if (!sendEMail) {
        console.log({
            api_error_message: "account confirmation email sending failure!"
        })
        return next(new Error('sending email failed!', { cause: 500 }))
    }

    console.log("\nTOURIST SIGN UP IS DONE!\n")
    res.status(StatusCodes.CREATED).json({
        message: "user added!"
    })
}

export const confirmAccount = async (req, res, next) => {
    console.log("\nTOURIST ACCOUNT CONFIRMATION API\n")

    const { confirmToken } = req.params

    const decodeToken = verifyToken({ token: confirmToken, signature: process.env.CONFIRM_LINK_SECRETE_KEY })
    console.log({
        message: "confirmation token is decoded!",
        confirmation_token: decodeToken
    })
    if (!decodeToken) {
        console.log({
            api_error_message: "failed to decode the confirmation token"
        })
        return next(new Error('failed to decode the confirmation token!', { cause: 400 }))
    }

    const getUser = await touristModel.findOne({ email: decodeToken?.email })
    console.log({ user_fetching_errors: getUser?.errors })
    if (!getUser) {
        console.log({
            api_error_message: "failed to fetch the user!",
        })
        return next(new Error('failed to find user!', { cause: 500 }))
    }
    console.log({
        message: "user fetched!",
        fetched_user: getUser
    })

    // the reason that this API on cloud gets this response always is that it sends the request twice by itslef
    // but it still works and not always has the request for hit twice , sometimes it hit once and it does work
    if (getUser.confirmed === true) {
        console.log({
            message: "user is already confirmed!",
            is_user_confirmed: getUser.confirmed
        })
        return next(new Error('user is already confirmed!', { cause: 400 }))
    }

    getUser.confirmed = true
    console.log("user is confirmed!")

    getUser.save()
    console.log("user is saved!")

    console.log("\nTOURIST ACCOUNT CONFIRMATION IS DONE\n")
    res.status(200).json({
        message: "confirmation done!"
    })
}

export const logInWithGmail = async (req, res, next) => {
    const client = new OAuth2Client()
    const { idToken } = req.body
    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
            // Or, if multiple clients access the backend:
            //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
        })
        const payload = ticket.getPayload()
        console.log({ social_login_payload: payload })
        return payload
    }

    const { email_verified, email, name } = await verify()
    if (!email_verified) {
        return next(new Error('invalid email', { cause: 400 }))
    }

    const getUser = await touristModel.findOne({ email, provider: 'GOOGLE' })

    if (getUser) {
        const token = generateToken({
            expiresIn: '1d',
            signature: process.env.LOGIN_SECRET_KEY,
            payload: {
                email: getUser.email,
                userName: getUser.userName,
                role: systemRoles.tourGuide
            }
        })

        if (!token) {
            console.log({
                api_error_message: "failed to generate user token!",
            })
            return next(new Error('failed to generate user token', { cause: 500 }))
        }
        console.log({
            message: "user token is generated!"
        })

        getUser.status = statuses.online
        getUser.token = token
        getUser.provider = socialProviders.google
        await getUser.save()

        console.log({
            message: "user is now online!",
            logged_in_user: {
                firstName: getUser.firstName,
                lastName: getUser.lastName,
                token: getUser.token,
                email: getUser.email,
                confirmed: getUser.confirmed
            }
        })

        return res.status(StatusCodes.OK).json({
            message: "tour guide logged in !",
            logged_in_user: {
                firstName: getUser.firstName,
                lastName: getUser.lastName,
                token: getUser.token,
                email: getUser.email,
                confirmed: getUser.confirmed
            }
        })
    }

    const newUserData = {
        userName: name,
        slug: slugify(name, '_'),
        email,
        password: nanoid(6),
        provider: socialProviders.google,
        confirmed: true,
        role: systemRoles.tourist,
    }

    const newUser = await touristModel.create(newUserData)
    if (!newUser) {
        console.log("failed to save the new user in the database!")
        return next(new Error('failed to save the new user in the database!', { cause: StatusCodes.INTERNAL_SERVER_ERROR }))
    }

    const token = generateToken({
        expiresIn: '1d',
        signature: process.env.LOGIN_SECRET_KEY,
        payload: {
            email: newUser.email,
            userName: newUser.userName,
            role: systemRoles.tourist
        }
    })
    if (!token) {
        console.log({
            api_error_message: "failed to generate user token!",
        })
        return next(new Error('failed to generate user token', { cause: 500 }))
    }
    console.log({
        message: "user token is generated!"
    })

    newUser.token = token
    newUser.status = statuses.online
    await newUser.save()

    res.status(StatusCodes.OK).json({
        message: "login is successful!",
        user: {
            userName: newUser.userName,
            email: newUser.email,
            token: newUser.token
        }
    })

    // client ID for the App (google cloud) -> from the ENV file

    // id token from the request body 

    /** if the social login is successful :
     * check if the user exists in database : 
     * if true : generate token and send a response (like in the login API)
     * if false : create a user in the database and then create a token and send a response (like the signUp API) :
     *  - note that the user will have no password but since it's database-critical , you will create it randomly and you won't use it anyway unless you will convert the user to be a system user
     */

    // consider an API that would convert a user that logins socially only to a normal system user

}

export const touristLogIn = async (req, res, next) => {
    console.log("\nTOURIST LOGIN API\n")

    const { email, password } = req.body

    const getUser = await touristModel.findOne({ email })
    console.log({ user_fetching_errors: getUser?.errors })
    if (!getUser) {
        console.log({
            user_error_message: "login email is invalid!"
        })
        return next(new Error('invalid login credentials', { cause: 400 }))
    }
    console.log({
        message: "user is found!",
        user: getUser
    })

    const isPassMatch = bcrypt.compareSync(password, getUser.password)
    console.log({
        is_password_valid: isPassMatch
    })
    if (!isPassMatch) {
        console.log({
            user_error_message: "login password is invalid!"
        })
        return next(new Error('your email or password is wrong!', { cause: 400 }))
    }

    const token = generateToken({
        expiresIn: '1d',
        signature: process.env.LOGIN_SECRET_KEY,
        payload: {
            email: getUser.email,
            userName: getUser.userName,
            role: systemRoles.tourist
        }
    })
    if (!token) {
        console.log({
            api_error_message: "failed to generate user token!",
        })
        return next(new Error('failed to generate user token', { cause: 500 }))
    }
    console.log({
        message: "user token is generated!"
    })

    const updateUser = await touristModel.findOneAndUpdate({ email }, { status: statuses.online, token }, { new: true }).select('userName email token confirmed -_id')
    console.log({ user_updating_errors: updateUser?.errors })
    if (!updateUser) {
        console.log({
            api_error_message: "failed to generate user token!",
        })
        return next(new Error('failed to login the user!', { cause: 500 }))
    }
    console.log({
        message: "user is now online!",
        logged_in_user: updateUser
    })

    console.log("\nTOURIST LOGIN IS DONE!\n")
    res.status(200).json({
        message: "login is successful!",
        user: updateUser
    })
}

// TODO : first make this api for tourists only , then make it for tourGuides and other roles 
export const forgetPassword = async (req, res, next) => {
    // this api occurs at the login page , doesn't need a token nor entering a password
    console.log("\nTOURIST FORGET PASSWORD API\n")
    const { email } = req.body

    const getUser = await touristModel.findOne({ email })
    console.log({ user_fetching_errors: getUser?.errors })
    if (!getUser) {
        console.log({
            api_error_message: "failed to fetch the user!",
        })
        return next(new Error('invalid email', { cause: 400 }))
    }
    console.log({
        message: "user fetched!",
        fetched_user: getUser
    })

    const code = nanoid2() // reset code generated
    console.log("reset code generated!")
    const hashedCode = bcrypt.hashSync(code, +process.env.FORGET_PASSWORD_CODE_SALT) // reset code hashed
    console.log("reset code hashed!")

    // we need this token to get the user Data from database in the reset password api
    const token = generateToken({
        payload: {
            email,
            resetCode: hashedCode
        },
        signature: process.env.reset_password_secret_key,
        expiresIn: '300s'
    })
    if (!token) {
        console.log({
            api_error_message: "failed to generate password reset token!",
        })
        return next(new Error('failed to generate password reset token', { cause: 500 }))
    }
    console.log({
        message: "password reset token is generated!"
    })

    // const resetPassLink = `${req.protocol}://${req.headers.host}/tourist/resetPassword${token}`
    const resetEmail = emailService({
        to: email,
        subject: 'Reset password',
        message: ` <h1>use this code below to reset your password in you app</h1>
                <p>${code}</p>`
    })
    if (!resetEmail) {
        console.log({
            api_error_message: "failed to send password reset email!",
        })
        return next(new Error('failed to send password reset email!', { cause: 400 }))
    }
    console.log({
        message: "password reset email sent!",
        reset_email: resetEmail
    })

    const updateUser = await touristModel.findOneAndUpdate({ email }, { resetCode: hashedCode, forgetPassword: true }, { new: true })
    console.log({ user_updating_errors: updateUser?.errors })
    if (!updateUser) {
        console.log({
            api_error_message: "failed to forget user password!",
        })
        return next(new Error('failed to forget password!', { cause: 400 }))
    }
    console.log({
        message: "password is now forgotten!"
    })

    // TODO : in the response , the 'resetCode' must be hashed or encrypted for the front end also and the front end can take that and dehash it
    console.log("\nTOURIST FORGET PASSWORD IS DONE!\n")
    res.status(200).json({
        message: "forget password done!",
        token,
        resetCode: code
    })
}

export const resetPassword = async (req, res, next) => {
    console.log("\nTOURIST PASSWORD RESET API\n")
    const { token } = req.params
    const { newPassword } = req.body

    let decodedToken
    try {
        decodedToken = verifyToken({
            token,
            signature: process.env.reset_password_secret_key
        })
    } catch (error) {
        console.log({
            api_error_message: "token decoding error",
            JWTerrorName: error.name,
            JWTerrorMessage: error.message
        })
        if (error.name === 'TokenExpiredError') {
            return next(new Error('reset code expired!', { cause: 408 }))
        }
    }
    if (!decodedToken) {
        console.log({
            api_error_message: "token decoding failure"
        })
        return next(new Error('failed to decode the token', { cause: 400 }))
    }
    console.log({
        message: "token decoded!",
        decoded_token: decodedToken
    })
    // if (decodedToken.Error.message === 'TokenExpiredError') {
    //     return next(new Error('reset code expired!', { cause: 408 }))
    // }

    const getUser = await touristModel.findOne({
        email: decodedToken.email,
    })
    console.log({ user_fetching_errors: getUser?.errors })
    if (!getUser) {
        console.log({
            api_error_message: "failed to find user!"
        })
        return next(new Error('failed to find user', { cause: 400 }))
    }
    if (decodedToken.resetCode !== getUser.resetCode) {
        console.log({
            api_error_message: "invalid reset code!"
        })
        return next(new Error('invalid reset code!', { cause: 400 }))
    }
    console.log({
        message: "user found!",
        user: getUser
    })

    const isPassMatch = await bcrypt.compare(newPassword, getUser.password)
    if (isPassMatch) {
        console.log({
            api_error_message: "new password duplicate",
            old_password: getUser.password,
            entered_new_password: newPassword
        })
        return next(new Error('enter a different password', { cause: 400 }))
    }
    console.log({
        message: "passwords match!",
        resetPasswordMatch: isPassMatch
    })

    const hashedNewPassword = bcrypt.hashSync(newPassword, +process.env.reset_password_salt)
    if (!hashedNewPassword) {
        console.log({
            api_error_message: "failure in hashing the new password"
        })
        return next(new Error('failed to hash the new password', { cause: 500 }))
    }
    getUser.password = hashedNewPassword
    console.log({
        message: "new password added!",
    })

    getUser.resetCode = null
    getUser.forgetPassword = false
    getUser.__v++
    console.log({
        message: "resetCode , forgetPassword are now back to default and version is incremented!"
    })

    if (!await getUser.save()) {
        console.log({
            api_error_message: "failed to save user changes in data base!"
        })
        return next(new Error('failed to reset password in data base', { cause: 500 }))
    }
    console.log({
        message: "user changes are saved in data base!"
    })

    console.log("\nTOURIST PASSWORD RESET IS DONE!\n")
    res.status(200).json({
        message: "reset password done!",
    })
}