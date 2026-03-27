const models = require('../database/models

const createProduct = async (data) => {
    let product = await models.product.findOne({ where: { name: data?.name } });
    if (product) return { status: 409, message: 'Product Already existy' }
    data = {...data}
    product = await models.product.create(data);
    return {succes: true,  status: 201, message: 'Product added Database', product}
}

module.exports = { createProduct };

































