const models = require("../database/models");
const { NotFoundError, ConflictError } = require("../middlewares/errors/httpErrors")
const ErrorCodes = require("./../middlewares/errors/codes");

const getAllProducts = async () => {
    const products = await models.product.findAll();
    return {status: 200, products}
}

const getProductById = async (id) => {
    const product = await models.product.findByPk(id);
    if(!product) throw new NotFoundError('Product not found', { code: ErrorCodes.PRODUCT_NOT_FOUND });
    return {status: 200, product};
}

const createProduct = async (data) => {
    let product = await models.product.findOne({ where: { name: data?.name } });
    if (product) throw new ConflictError('Product already exists', { code: ErrorCodes.DUPLICATE_PRODUCT })
    data = {...data}
    product = await models.product.create(data);
    return { status: 201, product }
}

const updateProduct = async (id, data) => {
    let product = await models.product.findByPk(id);
    if (!product) throw new NotFoundError('Product not found', { code: ErrorCodes.PRODUCT_NOT_FOUND });
    
    const cleanData = Object.keys(data).reduce((acc, key) => {
        if(data[key] !== undefined) {
            acc[key] = data[key];
        }
        return acc;
    }, {});
    
    product = await product.update(cleanData);
    return { status: 200, product };
}

const deleteProduct = async (id) => {
    const product = await models.product.findByPk(id);
    if (!product) throw new NotFoundError('Product not found', { code: ErrorCodes.PRODUCT_NOT_FOUND });
    await product.destroy();
    return { status: 204 }
}

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct };

