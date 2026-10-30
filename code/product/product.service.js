const models = require("../database/models");

const deleteProduct = async (id) => {
    const product = await models.product.findByPk(id);
    if (!product) return { success: false, status: 404, message: "Not Found" }
    await product.destroy();
    return { success: true, data: [], status: 204, message: "No content"}
}

module.exports = { deleteProduct };