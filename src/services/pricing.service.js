

const { PromoCode } = require('../models');

const calculatePricing = async (cart) => {
    const subtotal = cart.CartItems.reduce((sum, item) => {
        return sum + item.quantity * item.Product.price;
    }, 0);

    let discount = 0;
    let promoStatus = null;

    if (cart.promo_code) {
        const promo = await PromoCode.findByPk(cart.promo_code);

        if (!promo) {
            promoStatus = 'invalid_code';
        } else if (new Date(promo.expires_at) <= new Date()) {
            promoStatus = 'expired';
        } else if (promo.times_used >= promo.usage_limit) {
            promoStatus = 'usage_limit_reached';
        } else if (subtotal < promo.min_cart_total) {
            promoStatus = 'min_total_not_met';
        } else {
            promoStatus = 'valid';

            if (promo.type === 'percentage') {
                discount = Math.floor(subtotal * promo.value / 100);
            } else {
                discount = promo.value;
            }
        }
    }

    discount = Math.min(discount, subtotal);

    return {
        items: cart.CartItems.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity
        })),
        subtotal,
        discount,
        total: subtotal - discount,
        promo_code: cart.promo_code,
        promoStatus
    };
};

module.exports = {
    calculatePricing
};
