const APIError = require('./error.class')

const errorHandler = (error, req, res, next) => {
    if (error instanceof APIError) {
        console.log(error)
        res.status(error.statusCode).json({
            success: false,
            message: error.message,
        })
        next()
    } else {
        console.log(error)
        res.status(500).json({ success: false, message: error.message })
    }
}

module.exports = errorHandler
