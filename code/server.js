const express = require('express');
const app = express();
const errorHandler = require('./middlewares/error.middleware');
const { NotFoundError } = require('./middlewares/errors/httpErrors');
const { environment } = require("./config/config");

app.use(express.json());

if(environment === 'development') {
    app.use('/db', require('./database/db'))
}

app.use('/products', require("./product/routes"));

app.use((req, res, next) => {
    const error = new NotFoundError('Route not found', { code: 'ROUTE_NOT_FOUND' });
    next(error);
})

app.use(errorHandler);

module.exports = app;