export const GeneralResponse = (err, req, res, next) => {
    if (err) {
        const statusCode = err.cause || 500
        if (req.validationErrors) {
            return res
                .status(err['cause'] || 400)
                .json({
                    message: req.validationErrors
                })
        }
        res.status(statusCode).json({
            message: err.message,
            status: err.cause
        })
    }
}