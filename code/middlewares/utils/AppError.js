class AppError extends Error {
    constructor(message, { status = 400, code = 'APP_ERROR', details } = {} ) {
        super(message);
        this.name = new.target.name;
        this.status = status;
        this.code = code;
        this.details = details;
    }
}

module.exports = { AppError };