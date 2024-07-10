import mongoose from 'mongoose'

const DBconnection = async () => {
    return await mongoose.connect(process.env.DataBaseCloudUrl)
        .then((res) => {
            console.log('data base connected successfully!')
        })
        .catch((err) => {
            console.log({
                message: 'data base failed to connect!',
                error: err.message
            })
        })
}

export default DBconnection