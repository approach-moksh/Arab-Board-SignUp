const Sequelize = require('sequelize');

const sequelize = require('../database/db');

const OtpValue = sequelize.define('otp', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  otpValue: {
      type:Sequelize.INTEGER,
      defaultValue:null
    },
  expiresAt:{
    type:Sequelize.DataTypes.BIGINT,
    defaultValue:null
  }
});

module.exports = OtpValue;
