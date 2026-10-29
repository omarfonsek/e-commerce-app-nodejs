const validate = (schemas) => (req, res, next) => {

    const hasBody = req.headers['transfer-encoding'] !== undefined || Number(req.headers['content-length']) > 0;

    if (schemas.body && req.body === undefined && hasBody && !req.is('application/json')) {
        return res.status(415).json({
            error: {
                code: 'UNSUPPORTED_MEDIA_TYPE',
                message: 'The body must be sent in application/json'
            }
        });
    }
    const validated = {};
    const details = [];
    for (const [source, schema] of Object.entries(schemas)) {
        const input = source === 'body' ? (req.body ?? {}) : req[source];
        const result = schema.safeParse(input);
        if (!result.success) {
            for (const i of result.error.issues) {
                details.push({ path: i.path.join('.') === '' ? source : `${source}.${i.path.join('.')}`, message: i.message })
            }
            continue;
        }
        validated[source] = result.data;
    }
    if (details.length > 0) {
        return res.status(422).json({
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Invalid input data',
                details
            },
        });
    }
    req.validated = validated;
    next();
};

module.exports = validate;