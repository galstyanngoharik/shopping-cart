
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Cart = sequelize.define('Cart', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    promo_code: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'carts',
    timestamps: false
});

module.exports = Cart;
