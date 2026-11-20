
const { Product } = require('../models');
const AppError = require('../utils/AppError');

const createProduct = async (data) => {
    const { name, price, stock } = data;

    if (
        !name ||
        !Number.isSafeInteger(price) ||
        price < 0 ||
        !Number.isSafeInteger(stock) ||
        stock < 0
    ) {
        throw new AppError('Invalid product data', 400);
    }

    return Product.create({ name, price, stock });
};

module.exports = {
    createProduct
};
