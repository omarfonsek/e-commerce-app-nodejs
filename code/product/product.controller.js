const service = require("./product.service");

const deleteProduct = (req, res, next) => {
    const { id } = req.params;
    service
    .deleteProduct(id)
    .then((result) => {
        if (result.success) {
            res.status(result.status).json(result.data);
        }
        else {
            res.status(result.status).json({ error: result.message });
        }
        
    })
    .catch(next);
}
module.exports = { deleteProduct };