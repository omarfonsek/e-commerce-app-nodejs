const models = require("../database/models");

const getAllProducts = async () => {
    const data = await models.product.findAll();
    if( data.length == 0 ) return {sucess: true, status: 204, message: "There aren't products"};
    return {success: true, status: 200, data}
}

module.exports = { getAllProducts };