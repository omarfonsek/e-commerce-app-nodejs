const models = require("../database/models");

const getAllProducts = async () => {
    const data = await models.product.findAll();
    if( data.length == 0 ) return {sucess: true, status: 204, message: "There aren't products"};
    return {success: true, status: 200, data}
}

const getProductById = async (id) => {
    const product = await models.product.findByPk(id);
    if(!product) return {success: false, status: 404, message: 'Not Found'};
    return {success: true, status: 200, product};
}


module.exports = { getAllProducts, getProductById };