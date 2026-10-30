const models = require("../database/models");
const { NotFoundError, ConflictError } = require("../middlewares/errors/httpErrors")
const ErrorCodes = require("./../middlewares/errors/codes");

const getAllProducts = async () => {
    const data = await models.product.findAll();
    if( data.length == 0 ) return {success: true, status: 204, message: "There aren't products"};
    return {success: true, status: 200, data}
}

const getProductById = async (id) => {
    const product = await models.product.findByPk(id);
    if(!product) throw new NotFoundError('Product not found', { code: ErrorCodes.PRODUCT_NOT_FOUND });
    return {success: true, status: 200, product};
}

const createProduct = async (data) => {
    let product = await models.product.findOne({ where: { name: data?.name } });
    if (product) throw new ConflictError('Product already exists', { code: ErrorCodes.DUPLICATE_PRODUCT })
    data = {...data}
    product = await models.product.create(data);
    return {success: true,  status: 201, message: 'Product added Database', product}
}

const updateProduct = async (id, data) => {
    const product = await models.product.findByPk(id);
    if (!product) throw new NotFoundError('Product not found', { code: ErrorCodes.PRODUCT_NOT_FOUND });
    
    const cleanData = Object.keys(data).reduce((acc, key) => {
        if(data[key] !== undefined) {
            acc[key] = data[key];
        }
        return acc;
    }, {});
    
    const updatedProduct = await product.update(cleanData);
    return {success: true, updatedProduct, status: 200};
}

const deleteProduct = async (id) => {
    const product = await models.product.findByPk(id);
    if (!product) throw new NotFoundError('Product not found', { code: ErrorCodes.PRODUCT_NOT_FOUND });
    await product.destroy();
    return { success: true, data: [], status: 204, message: "No content"}
}

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct };

