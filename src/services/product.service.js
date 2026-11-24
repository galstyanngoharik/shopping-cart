
const { Product } = require('../models');
const AppError = require('../utils/AppError');

const POSTGRES_INTEGER_MAX = 2_147_483_647;

const createProduct = async (data) => {
    const { name, price, stock } = data ?? {};
    const productName = typeof name === 'string' ? name.trim() : '';

    if (
        productName.length === 0 ||
        productName.length > 255 ||
        !Number.isInteger(price) ||
        price < 0 ||
        price > POSTGRES_INTEGER_MAX ||
        !Number.isInteger(stock) ||
        stock < 0 ||
        stock > POSTGRES_INTEGER_MAX
    ) {
        throw new AppError('Invalid product data', 400);
    }

    return Product.create({
        name: productName,
        price,
        stock
    });
};

module.exports = {
    createProduct
};