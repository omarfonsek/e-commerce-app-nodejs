require('dotenv').config();

const {
    UniqueConstraintError, ValidationError, ForeignKeyConstraintError, 
    EmptyResultError, OptimisticLockError, ConnectionError, 
    TimeoutError, DatabaseError, 
} = require('sequelize');

const { AppError } = require('./utils/AppError');

const mapError = (err) => {

    if(err.type === 'entity.parse.failed') {
        return { status: 400, code: 'MALFORMED_JSON', message: 'The request body is not valid JSON' };
    }
    if(err.type === 'entity.too.large') {
        return { status: 413, code: 'PAYLOAD_TOO_LARGE', message: 'The body of the request is too large' }
    }
    if (err instanceof AppError) { return {
        status: err.status,
        code: err.code,
        message: err.message,
        details: err.details
    }}
    if(err instanceof UniqueConstraintError) { return {
        status: 409,
        code: 'DUPLICATE',
        message: 'The resource already exists',
        details: err.errors.map(e => ({ field: e.path, message: e.message }))
    }}
    if (err instanceof ValidationError) { return {
        status: 422,
        code: 'VALIDATION_ERROR',
        message:'Invalid input data',
        details: err.errors.map( e => ({ field: e.path, message: e.message, rule: e.validatorKey }))
    }}
    if (err instanceof ForeignKeyConstraintError) { return {
         status: 409, 
         code: 'FK_CONSTRAINT',  
         message: 'Invalid reference or resource in use'
    }}
    if (err instanceof EmptyResultError) { return {
        status: 404,
        code: 'NOT_FOUND',
        message: 'Resource not found'
    }}
    if (err instanceof OptimisticLockError) { return {
        status: 409,
        code: 'CONFLICT',
        message: 'The resource was modified by another proceeding.'
    }}
    if (err instanceof TimeoutError || err instanceof ConnectionError) { return {
        status: 503,
        code: 'DB_UNAVAILABLE',
        message: 'Service temporarily unavailable'
    }}
    if (err instanceof DatabaseError) { return {
        status: 500,
        code: 'DB_ERROR',
        message: 'Internal Server Error'
    }}

    return { status: 500, code: 'INTERNAL', message: 'Internal Server Error' }
}

const errorHandler = (err, req, res, next) => {

    if(res.headersSent) return next(err);

    const { status, code, message, details } = mapError(err);

    if(status >= 500) console.error(err.stack)

    res.status(status).json({
        error: {
            code, 
            message,
            ...(details && { details }),
            ...(process.env.NODE_ENV === 'development' && {stack: err.stack})
        }
    });
};

module.exports = errorHandler;