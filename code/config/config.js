require('dotenv').config();

module.exports = {
    dbConfig: {
        connection: {
            user: process.env.DB_USER,
            pass: process.env.DB_PASS,
            dbName: process.env.DB_NAME
        },
        configOptions: {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            dialect: process.env.DIALECT,
            logging: true
        }
    }
}