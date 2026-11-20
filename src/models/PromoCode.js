

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PromoCode = sequelize.define('PromoCode', {
    code: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    type: {
        type: DataTypes.ENUM('percentage', 'fixed'),
        allowNull: false
    },
    value: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    min_cart_total: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    expires_at: {
        type: DataTypes.DATE,
        allowNull: false
    },
    usage_limit: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    times_used: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
}, {
    tableName: 'promo_codes',
    timestamps: false
});

module.exports = PromoCode;
