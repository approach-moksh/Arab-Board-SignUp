const Sequelize= require('sequelize');
const config = require('config');

const sequelize = new Sequelize(config.get("Db.dbname"),config.get("Db.username"),config.get("Db.password"),{
    dialect:"mysql",
    host: config.get("Db.host"),
});

module.exports = sequelize;