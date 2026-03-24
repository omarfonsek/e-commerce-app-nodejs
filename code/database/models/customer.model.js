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
        mobile: {
            type: DataTypes.STRING(15),
            allowNull: true,
            unique: true
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
    };

    const options = {
        timestamps: true,
        freezeTableName: true
    }

    const _model = sequelize.define('customer', attributes, options)
    _model.associate = function(models) {
        _model.hasMany(models.order, {
            foreignKey: 'customerId',
            as: "orders"
        });
    
        _model.hasMany(models.payment, {
            foreignKey: 'customerId',
            as: 'payments'
        });

        _model.hasOne(models.cart, {
            foreignKey: 'customerId',
            as: 'cartDetail'
    });

    }

    

    return _model;
}

module.exports = model;