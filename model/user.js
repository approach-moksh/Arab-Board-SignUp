const {Sequelize,DataTypes,Model} = require('sequelize');
const Category= require('./category');

const OtpValue= require('./UserPasswordReset');

const bcrypt = require('bcryptjs');

const sequelize = require('../database/db');

class User extends Model{}

User.init({
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  firstname: {
      type:Sequelize.STRING,
      allowNull: false,
    },
  lastname: {
    type: Sequelize.STRING,
    allowNull: false
    },
  phone:{
      type:Sequelize.BIGINT,
      allowNull: false
    },
  gender:{
    type:Sequelize.STRING,
    allowNull: false,
    defaultValue:"male"
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique:true,
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
    set(value){
      const hash=bcrypt.hashSync(value,12)
      this.setDataValue('password',hash);
    }
  },
  verified:{
    type: DataTypes.ENUM("0","1"),
    allowNull: false,
    defaultValue:"0",
    comment:"0 for not confirmed mail"
  },
  profileUrl: {
    type: Sequelize.STRING,
    allowNull: false
  },
  token:{
    type: Sequelize.STRING,
    defaultValue:null
  },
  isLoggedIn:{
    type: DataTypes.BOOLEAN,
    defaultValue:false
  },
},
{
  sequelize,
  modelName:'user',
});

User.belongsTo(Category,{constrains: true,onDelete:'CASCADE'}),
Category.hasMany(User);

OtpValue.belongsTo(User,{constrains: true,onDelete:'CASCADE'});
User.hasMany(OtpValue);


module.exports = User;
