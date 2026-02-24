const service = require("./product.service");

const getAllProducts = (req, res, next) => {
    service
    .getAllProducts()
    .then((data) => {
        res.status(data.status).json(data);
    })
    .catch(next);
}

module.exports = { getAllProducts };
