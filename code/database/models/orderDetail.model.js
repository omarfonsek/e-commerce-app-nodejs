function model (sequelize, DataTypes) {
    const attributes = {
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