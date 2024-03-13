const Sequelize = require('sequelize');

const db = new Sequelize(
    process.env.DB_NAME, 
    process.env.DB_USER, 
    process.env.DB_PASS, 
    
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'mysql',
    // operatorsAliases: false,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    define: {
        freezeTableName: true
    },
    dialectOptions: {
        decimalNumbers: true
    },
    logging: false,
});

db.authenticate()
    .then(() => console.log('Successfully connected to database'))
    .catch(err => console.log('Database connection error: ',err));

module.exports = db;

