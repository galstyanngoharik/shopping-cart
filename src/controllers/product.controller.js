

const productService = require('../services/product.service');
const asyncHandler = require('../utils/asyncHandler');

const createProduct = asyncHandler(async (req, res) => {
    const product = await productService.createProduct(req.body);

    res.status(201).json({
        success: true,
        data: product
    });
});

module.exports = {
    createProduct
};
