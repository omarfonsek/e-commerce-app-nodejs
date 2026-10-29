function model(sequelize, DataTypes) {
    const attributes = {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        picture: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        price: {
            type: DataTypes.DOUBLE(10, 2),
            allowNull: true
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
            defaultValue: null
        },
    };

    const options = {
        timestamps: true,
        freezeTableName: true
    };

    const _model = sequelize.define('product', attributes, options)
    _model.associate = function(models) {
        _model.belongsToMany(models.cart, {
            through: 'cartProducts',
            foreignKey: 'productId',
            as: 'carts'
        });

        _model.belongsToMany(models.category, {
            through: 'productCategories',
            foreignKey: 'productId',
            as: 'categories'
        });

        _model.belongsToMany(models.order, {
            through: 'orderDetail',
            foreignKey: 'productId',
            as: 'orders'
        });

        _model.hasMany(models.orderDetail, {
            foreignKey: 'productId',
            as: 'productDetails'
        })
    };

    return _model;
}

module.exports = model;