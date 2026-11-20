# Shopping Cart with Promo Codes

A REST API for managing shopping carts, products, and discount codes.

Built with Node.js, Express.js, PostgreSQL, and Sequelize.

## Features

- Create products
- Create shopping carts
- Add, update, and remove cart items
- Apply and remove promo codes
- Calculate subtotal, discount, and total
- Validate product stock and promo codes
- Checkout and update product stock

## Technologies

- Node.js
- Express.js
- PostgreSQL
- Sequelize

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd shopping-cart
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a PostgreSQL database:

   ```sql
   CREATE DATABASE shopping_cart;
   ```

4. Create a `.env` file:

   ```env
   PORT=3000
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=shopping_cart
   DB_USER=postgres
   DB_PASSWORD=your_password
   ```

5. Start the server:

   ```bash
   npm run dev
   ```

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/products` | Create a product |
| POST | `/carts` | Create an empty cart |
| PUT | `/carts/:id/items` | Set product quantity |
| POST | `/carts/:id/promo` | Apply a promo code |
| DELETE | `/carts/:id/promo` | Remove a promo code |
| GET | `/carts/:id` | Get cart with pricing |
| POST | `/carts/:id/checkout` | Checkout |

## Example Requests

### Create Product

`POST /products`

```json
{
  "name": "Product A",
  "price": 5000,
  "stock": 3
}
```

### Set Item Quantity

`PUT /carts/1/items`

```json
{
  "product_id": 1,
  "quantity": 2
}
```

### Apply Promo Code

`POST /carts/1/promo`

```json
{
  "code": "SAVE10"
}
```

## Example Promo Code

Insert a promo code into PostgreSQL:

```sql
INSERT INTO promo_codes (
    code,
    type,
    value,
    min_cart_total,
    expires_at,
    usage_limit,
    times_used
)
VALUES (
    'SAVE10',
    'percentage',
    10,
    8000,
    '2027-12-31',
    100,
    0
);
```

## Business Rules

- Product quantity cannot exceed available stock.
- Percentage discounts are rounded down.
- Total cannot be negative.
- Promo codes must be valid and meet the minimum cart total.
- Invalid promo codes remain attached if the cart total drops below the minimum.
- Checkout validates stock and promo codes, updates stock and promo usage, and empties the cart.

## Error Codes

- `400` — Invalid quantity or promo code conditions
- `404` — Product, cart, or promo code not found
- `409` — Insufficient stock at checkout
