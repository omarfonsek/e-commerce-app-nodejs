const { AppError } = require('./../utils/AppError');

class NotFoundError extends AppError {
    constructor(message, opts = {}) {
        super(message, { code: 'NOT_FOUND', ...opts, status: 404 });
    }
}

class ConflictError extends AppError{
    constructor(message, opts = {}) {
        super(message, { code: 'CONFLICT', ...opts, status: 409 });
    }
}

class UnauthorizedError extends AppError {
    constructor(message, opts = {}) {
        super(message, { code: 'UNAUTHORIZED', ...opts, status: 401 });
    }
}

class BusinessRuleError extends AppError {
    constructor(message, opts = {}) {
        super(message, { code: 'BUSINESS_RULE', ...opts, status: 422 });
    }
}

class ForbiddenError extends AppError {
    constructor(message, opts = {}) {
        super(message, { code: 'FORBIDDEN', ...opts, status: 403 });
    }
}

module.exports = { NotFoundError, ConflictError, UnauthorizedError, BusinessRuleError, ForbiddenError };