const service = require('./product.service');

const createProduct = (req, res, next) => {
    service
    .createProduct(req.body)
    .then((data) => {
        res.status(data.status);
        res.json(data);
    })
    .catch(next); // Se envía el error al middleware global de erroes
}

module.exports = { createProduct };