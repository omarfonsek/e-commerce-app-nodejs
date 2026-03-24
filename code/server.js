const express = require('express');
const app = express();

app.use(express.json());

app.use('/db', require('./database/db'));

app.use("/products", require("./products/routes"));

module.exports = app;
 