const { DataTypes } = require('sequelize')
const bcrypt = require('bcryptjs')

const sequelize = require('../lib/sequelize')
const { Photo } = require('./photo')
const { Review } = require('./review')
const { Business } = require('./business')

const User = sequelize.define('user', {
    userId: { type: DataTypes.INTEGER, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    password: { type: DataTypes.STRING, set(value) { this.setDataValue('password', bcrypt.hash(value, 8)) }, allowNull: false },
    admin: { type: DataTypes.BOOLEAN, allowNull: false }
})

User.hasMany(Business, { foreignKey: { allowNull: false } })
Business.belongsTo(User)

User.hasMany(Photo, { foreignKey: { allowNull: false } })
Photo.belongsTo(User)

User.hasMany(Review, { foreignKey: { allowNull: false } })
Review.belongsTo(User)

exports.User = User

exports.UserClientFields = [
    'userId',
    'name',
    'email',
    'password',
    'admin'
]
