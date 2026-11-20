
const express = require('express');
const cartController = require('../controllers/cart.controller');

const router = express.Router();

router.post('/', cartController.createCart);

router.put('/:id/items', cartController.setItemQuantity);

router.post('/:id/promo', cartController.applyPromo);

router.delete('/:id/promo', cartController.removePromo);

router.get('/:id', cartController.getCart);

router.post('/:id/checkout', cartController.checkout);

module.exports = router;
