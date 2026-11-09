const service = require("./product.service");

const getAllProducts = (req, res, next) => {
    service
    .getAllProducts()
    .then((data) => {
        res.status(data.status).json({ products: data.products });
    })
    .catch(next);
}

const getProductById = (req, res, next) => {
    const { id } = req.validated.params;
    service
    .getProductById(id)
    .then((data) => {
        res.status(data.status).json({ product: data.product });
    })
    .catch(next);
}

const createProduct = (req, res, next) => {
    service
    .createProduct(req.validated.body)
    .then((data) => {
        res.status(data.status).json({ product: data.product });
    })
    .catch(next);
}

const updateProduct = (req, res, next) => {
    const { id } = req.validated.params;
    const  data  = req.validated.body;
    service
    .updateProduct(id, data)
    .then((data) => {
            res.status(data.status).json({ product: data.product });
    })
    .catch(next);
    }

const deleteProduct = (req, res, next) => {
    const { id } = req.validated.params;
    service
    .deleteProduct(id)
    .then((data) => {
            res.status(data.status).end();
    })
    .catch(next);
}

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct };

