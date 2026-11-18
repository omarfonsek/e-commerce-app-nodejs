const models = require("../../database/models");
const { dbConfig } = require("../../config/config")

const validateDbName = () => {
    const databaseName = dbConfig.connection.dbName;
    if (!databaseName) throw new Error('Database name is required');
    if (!databaseName.endsWith('_test')) throw new Error('Database name must end in "_test"');
    
}

validateDbName();

const resetDb = async () => {
    await models.sequelize.sync({ force: true });
}

const closeDb = async () => {
    await models.sequelize.close();
}

module.exports = { resetDb, closeDb };
