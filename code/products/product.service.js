const models = require("../database/models");

const updateProduct = async (id, data) => {
    const product = await models.product.findByPk(id);
    if (!product) return { success: false, status: 404, message: 'Not Found'}
    
    const cleanData = Object.keys(data).reduce((acc, key) => {
        if(data[key] !== undefined) {
            acc[key] = data[key];
        }
        return acc;
    }, {});
    
    const updatedProduct = await product.update(cleanData);
    return {success: true, updatedProduct, status: 200};
}

module.exports = { updateProduct };
