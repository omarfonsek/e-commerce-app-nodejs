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

const createProduct = async (data) => {
    let product = await models.product.findOne({ where: { name: data?.name } });
    if (product) return { status: 409, message: 'Product Already existy' }
    data = {...data}
    product = await models.product.create(data);
    return {succes: true,  status: 201, message: 'Product added Database', product}
}

module.exports = { getAllProducts, getProductById, createProduct };

