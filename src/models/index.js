
const sequelize = require('../config/database');

const Product = require('./Product');
const Cart = require('./Cart');
const CartItem = require('./CartItem');
const PromoCode = require('./PromoCode');

Cart.hasMany(CartItem, {
    foreignKey: 'cart_id'
});

CartItem.belongsTo(Cart, {
    foreignKey: 'cart_id'
});

Product.hasMany(CartItem, {
    foreignKey: 'product_id'
});

CartItem.belongsTo(Product, {
    foreignKey: 'product_id'
});

module.exports = {
    sequelize,
    Product,
    Cart,
    CartItem,
    PromoCode
};
