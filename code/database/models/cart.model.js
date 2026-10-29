function model(sequelize, DataTypes) {
    const attributes = {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        customerId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
    };

    const options = {
        timestamps: true,
        freezeTableName: true
    };

    const _model = sequelize.define('cart', attributes, options)
    _model.associate = function(models) {
        _model.hasOne(models.customer, {
            foreignKey: 'customerId',
            as: 'cart'
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

