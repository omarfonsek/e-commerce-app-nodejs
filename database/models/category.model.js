function model (sequelize, DataTypes) {
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
            allowNull: true,
            defaultValue: null
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
            default: null
        },
    };

    const options= {
        timestamps: true,
        freezeTableName: true
    };

    const _model = sequelize.define('category', attributes, options)

    return _model;
}

module.exports = model; 