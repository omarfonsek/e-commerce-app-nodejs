function model(sequelize, DataTypes) {
    const attributes = {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
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

    return _model;
}

module.exports = model;