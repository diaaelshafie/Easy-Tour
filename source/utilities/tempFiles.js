import path from 'path'
import fsPromise from 'fs/promises'

export async function deleteTempFiles() {
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