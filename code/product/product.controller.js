const service = require("./product.service");

const getAllProducts = (req, res, next) => {
    service
    .getAllProducts()
    .then((data) => {
        res.status(data.status).json(data);
    })
    .catch(next);
}

const getProductById = (req, res, next) => {
    const { id } = req.params;
    service
    .getProductById(id)
    .then((data) => {
        res.status(data.status).json(data);
    })
    .catch(next);
}

module.exports = { getAllProducts, getProductById };
