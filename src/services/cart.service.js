
const {
    sequelize,
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

const loadCartWithItems = async (cartId, transaction) => {
    const cart = await Cart.findByPk(cartId, {
        include: [{
            model: CartItem,
            include: [Product]
        }],
        transaction
    });

    if (!cart) {
        throw new AppError('Cart not found', 404);
    }

    return cart;
};

const lockCart = async (cartId, transaction) => {
    const cart = await Cart.findByPk(cartId, {
        transaction,
        lock: transaction.LOCK.UPDATE
    });

    if (!cart) {
        throw new AppError('Cart not found', 404);
    }

    return cart;
};

const validatePromo = (pricing) => {
    if (pricing.promoStatus === 'invalid_code') {
        throw new AppError('Promo code not found', 404);
    }

    if (pricing.promoStatus !== 'valid') {
        throw new AppError(pricing.promoStatus, 400);
    }
};

const getCart = async (cartId, transaction) => {
    const cart = await loadCartWithItems(cartId, transaction);

    return calculatePricing(cart, { transaction });
};

const setItemQuantity = async (cartId, productId, quantity) => {
    if (!Number.isSafeInteger(quantity) || quantity < 0) {
        throw new AppError('Invalid quantity', 400);
    }

    return sequelize.transaction(async (transaction) => {
        await lockCart(cartId, transaction);

        const product = await Product.findByPk(productId, {
            transaction,
            lock: transaction.LOCK.UPDATE
        });

        if (!product) {
            throw new AppError('Product not found', 404);
        }

        if (quantity > product.stock) {
            throw new AppError('Insufficient stock', 400);
        }

        const where = {
            cart_id: cartId,
            product_id: productId
        };

        if (quantity === 0) {
            await CartItem.destroy({ where, transaction });
        } else {
            const item = await CartItem.findOne({ where, transaction });

            if (item) {
                await item.update({ quantity }, { transaction });
            } else {
                await CartItem.create({
                    ...where,
                    quantity
                }, { transaction });
            }
        }

        return getCart(cartId, transaction);
    });
};

const applyPromo = async (cartId, code) => {
    if (typeof code !== 'string' || !code.trim()) {
        throw new AppError('Invalid promo code', 400);
    }

    return sequelize.transaction(async (transaction) => {
        await lockCart(cartId, transaction);
        const cart = await loadCartWithItems(cartId, transaction);

        cart.promo_code = code.trim();

        const pricing = await calculatePricing(cart, {
            transaction,
            lockPromo: true
        });

        validatePromo(pricing);

        await cart.save({ transaction });

        return pricing;
    });
};

const removePromo = async (cartId) => {
    return sequelize.transaction(async (transaction) => {
        const cart = await lockCart(cartId, transaction);

        await cart.update({ promo_code: null }, { transaction });

        return getCart(cartId, transaction);
    });
};

const checkout = async (cartId) => {
    return sequelize.transaction(async (transaction) => {
        await lockCart(cartId, transaction);
        const cart = await loadCartWithItems(cartId, transaction);

        if (cart.CartItems.length === 0) {
            throw new AppError('Cart is empty', 400);
        }

        const sortedItems = [...cart.CartItems].sort(
            (first, second) => first.product_id - second.product_id
        );

        for (const item of sortedItems) {
            const product = await Product.findByPk(item.product_id, {
                transaction,
                lock: transaction.LOCK.UPDATE
            });

            if (!product) {
                throw new AppError('Product not found', 404);
            }

            if (item.quantity > product.stock) {
                throw new AppError('Insufficient stock', 409);
            }

            await product.update({
                stock: product.stock - item.quantity
            }, { transaction });

            item.Product = product;
        }

        const pricing = await calculatePricing(cart, {
            transaction,
            lockPromo: true
        });

        if (cart.promo_code) {
            validatePromo(pricing);

            await PromoCode.increment('times_used', {
                by: 1,
                where: { code: cart.promo_code },
                transaction
            });
        }

        await CartItem.destroy({
            where: { cart_id: cartId },
            transaction
        });

        await cart.update({ promo_code: null }, { transaction });

        return pricing;
    });
};

module.exports = {
    createCart,
    getCart,
    setItemQuantity,
    applyPromo,
    removePromo,
    checkout
};