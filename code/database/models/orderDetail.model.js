function model (sequelize, DataTypes) {
    const attributes = {
        orderId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        productId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        price: {
            type: DataTypes.DOUBLE(10, 2),
            allowNull: false
        }
    };

    const options = {
        timestamps: true,
        freezeTableName: true
    };

    const _model = sequelize.define('orderDetail', attributes, options)

    return _model;
}

module.exports = model;