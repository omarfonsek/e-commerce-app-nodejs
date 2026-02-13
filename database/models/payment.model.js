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
        type: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        amount: {
            type: DataTypes.DOUBLE(10, 2),
            allowNull: true
        },
    };

    const options = {
        timestamps: true,
        freezeTableName: true
    };

    const _model = sequelize.define('payment', attributes, options)
    _model.associate = function(models) {
        _model.belongsTo(models.customer, {
            foreignKey: 'customerId',
            as: 'customer'
        });

        _model.hasMany(models.order, {
            foreignKey: 'paymentId',
            as: 'orders'
        })
    }

    return _model;
}

module.exports = model;
