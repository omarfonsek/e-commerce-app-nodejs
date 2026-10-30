function model(sequelize, DataTypes) {
    const attributes = {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        total: {
            type: DataTypes.DOUBLE(10, 2),
            allowNull: false
        },
    };

    const options = {
        timestamps: true,
        freezeTableName: true
    };

    const _model = sequelize.define('cart', attributes, options)
    _model.associate = function(models) {
        _model.belongsTo(models.customer, {
            foreignKey: 'customerId',
            as: 'customerDetail'
    });

        _model.belongsToMany(models.product, {
            through: 'cartProducts',
            foreignKey: 'cartId',
            as: 'products'
        });
    }

    return _model;
}

module.exports = model;

