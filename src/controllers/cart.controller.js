
const cartService = require('../services/cart.service');
const asyncHandler = require('../utils/asyncHandler');

const createCart = asyncHandler(async (req, res) => {
    const cart = await cartService.createCart();

    res.status(201).json({
        success: true,
        data: cart
    });
});

const getCart = asyncHandler(async (req, res) => {
    const { items, subtotal, discount, total, promo_code } =
        await cartService.getCart(req.params.id);

    res.status(200).json({
        items,
        subtotal,
        discount,
        total,
        promo_code
    });
});

const setItemQuantity = asyncHandler(async (req, res) => {
    const { product_id, quantity } = req.body ?? {};

    const cart = await cartService.setItemQuantity(
        req.params.id,
        product_id,
        quantity
    );

    res.status(200).json({
        success: true,
        data: cart
    });
});

const applyPromo = asyncHandler(async (req, res) => {
    const cart = await cartService.applyPromo(
        req.params.id,
        req.body?.code
    );

    res.status(200).json({
        success: true,
        data: cart
    });
});

const removePromo = asyncHandler(async (req, res) => {
    const cart = await cartService.removePromo(req.params.id);

    res.status(200).json({
        success: true,
        data: cart
    });
});

const checkout = asyncHandler(async (req, res) => {
    const result = await cartService.checkout(req.params.id);

    res.status(200).json({
        success: true,
        data: result
    });
});

module.exports = {
    createCart,
    getCart,
    setItemQuantity,
    applyPromo,
    removePromo,
    checkout
};