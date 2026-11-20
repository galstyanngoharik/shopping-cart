

const {
    Cart,
    CartItem,
    Product,
    PromoCode
} = require('../models');

const AppError = require('../utils/AppError');
const { calculatePricing } = require('./pricing.service');

const createCart = async () => {
    return Cart.create();
};

const getCart = async (id) => {
    const cart = await Cart.findByPk(id, {
        include: [{
            model: CartItem,
            include: [Product]
        }]
    });

    if (!cart) {
        throw new AppError('Cart not found', 404);
    }

    return calculatePricing(cart);
};

const setItemQuantity = async (cartId, productId, quantity) => {
    if (!Number.isSafeInteger(quantity) || quantity < 0) {
        throw new AppError('Invalid quantity', 400);
    }

    const cart = await Cart.findByPk(cartId);

    if (!cart) {
        throw new AppError('Cart not found', 404);
    }

    const product = await Product.findByPk(productId);

    if (!product) {
        throw new AppError('Product not found', 404);
    }

    if (quantity > product.stock) {
        throw new AppError('Insufficient stock', 400);
    }

    const item = await CartItem.findOne({
        where: {
            cart_id: cartId,
            product_id: productId
        }
    });

    if (quantity === 0) {
        if (item) {
            await item.destroy();
        }
    } else if (item) {
        await item.update({ quantity });
    } else {
        await CartItem.create({
            cart_id: cartId,
            product_id: productId,
            quantity
        });
    }

    return getCart(cartId);
};

const applyPromo = async (cartId, code) => {
    const cart = await Cart.findByPk(cartId, {
        include: [{
            model: CartItem,
            include: [Product]
        }]
    });

    if (!cart) {
        throw new AppError('Cart not found', 404);
    }

    if (typeof code !== 'string' || !code.trim()) {
        throw new AppError('Invalid promo code', 400);
    }

    const promo = await PromoCode.findByPk(code);

    if (!promo) {
        throw new AppError('Promo code not found', 404);
    }

    cart.promo_code = code;

    const pricing = await calculatePricing(cart);

    if (pricing.promoStatus !== 'valid') {
        throw new AppError(pricing.promoStatus, 400);
    }

    await cart.save();

    return getCart(cartId);
};

const removePromo = async (cartId) => {
    const cart = await Cart.findByPk(cartId);

    if (!cart) {
        throw new AppError('Cart not found', 404);
    }

    await cart.update({ promo_code: null });

    return getCart(cartId);
};

const checkout = async (cartId) => {
    const cart = await Cart.findByPk(cartId, {
        include: [{
            model: CartItem,
            include: [Product]
        }]
    });

    if (!cart) {
        throw new AppError('Cart not found', 404);
    }

    if (cart.CartItems.length === 0) {
        throw new AppError('Cart is empty', 400);
    }

    for (const item of cart.CartItems) {
        const product = await Product.findByPk(item.product_id);

        if (!product || item.quantity > product.stock) {
            throw new AppError('Insufficient stock', 409);
        }
    }

    const pricing = await calculatePricing(cart);

    if (cart.promo_code && pricing.promoStatus !== 'valid') {
        throw new AppError(pricing.promoStatus, 400);
    }

    for (const item of cart.CartItems) {
        await Product.decrement('stock', {
            by: item.quantity,
            where: { id: item.product_id }
        });
    }

    if (cart.promo_code) {
        await PromoCode.increment('times_used', {
            by: 1,
            where: { code: cart.promo_code }
        });
    }

    await CartItem.destroy({
        where: { cart_id: cartId }
    });

    await cart.update({ promo_code: null });

    return pricing;
};

module.exports = {
    createCart,
    getCart,
    setItemQuantity,
    applyPromo,
    removePromo,
    checkout
};
