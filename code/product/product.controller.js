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

const updateProduct = (req, res, next) => {
    const { id } = req.params;
    const  data  = req.body;
    service
    .updateProduct(id, data)
    .then((result) => {
        if (result.success) {
            res.status(result.status).json(result.updatedProduct);
        }
        else {
            res.status(result.status).json({ error: result.error });
        }
    })
    .catch(next);
    }

module.exports = { createProduct, updateProduct };
