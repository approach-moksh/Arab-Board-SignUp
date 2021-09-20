const Sequelize = require('sequelize');

const sequelize = require('../database/db');

const Category = sequelize.define('categories', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  Category: {
      type:Sequelize.STRING,
      allowNull: false,
    } 
});

module.exports = Category;
