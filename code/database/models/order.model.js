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
        paymentId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        amount: {
            type: DataTypes.DOUBLE(10, 2),
            allowNull: true
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false
        },
    };

    const options = {
        timestamps: true,
        freezeTableName: true
    };

    const _model = sequelize.define('order', attributes, options)
    _model.associate = function(models) {
        _model.belongsTo(models.customer, {
            foreignKey: 'customerId',
            as: 'customer'
        });

        _model.belongsToMany(models.product, {
            through: 'orderDetail',
            foreignKey: 'orderId',
            as: 'products'
        });

        _model.belongsTo(models.payment, {
            foreignKey: 'paymentId',
            as: "payment"
        });
        
    }

    return _model;
}

module.exports = model;