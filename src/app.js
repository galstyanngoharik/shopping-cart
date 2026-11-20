

const express = require('express');

const productRoutes = require('./routes/product.routes');
const cartRoutes = require('./routes/cart.routes');
const errorHandler = require('./middlewares/error.middleware');

const app = express();

app.use(express.json());

app.use('/products', productRoutes);
app.use('/carts', cartRoutes);

app.use(errorHandler);

module.exports = app;
