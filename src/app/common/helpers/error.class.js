class APIError extends Error {
    constructor(
        message = 'Error occured',
        statusCode = 400,
        method = 'unknown'
    ) {
        super(message)
        this.message = message
        this.statusCode = statusCode
        this.method = method
        Error.captureStackTrace(this)
    }
}

module.exports = APIError
