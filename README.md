# ShopKart

A full-stack e-commerce application built with MongoDB, Express, React, and Node.js. ShopKart brings together product discovery, a persistent wishlist and cart, Razorpay Test Mode checkout, order history, and an admin inventory dashboard.

Built as a MERN course project, with a React frontend and an Express backend organized into models, controllers, and routes.

## Features

- **Authentication:** Register, sign in, and sign out using JWT authentication with HTTP-only cookies and bcrypt password hashing.
- **Product discovery:** Browse product details, search by name, filter by category, and sort by price.
- **Wishlist and cart:** Save products, manage quantities, and keep selections in MongoDB across sessions.
- **Test checkout:** Enter a shipping address and complete a Razorpay Test Mode payment in INR.
- **Order history:** View your orders, payment status, shipping address, and purchased item details.
- **Inventory management:** Admins can create, edit, delete, and restock products.
- **Payment verification:** The backend calculates totals, verifies payment signatures, and updates stock, the order, and the cart in a database transaction.

## Tech stack

| Layer | Technologies |
| --- | --- |
| Frontend | React 18, Vite 6, React Router, Tailwind CSS, Lucide icons |
| API client | Axios |
| Backend | Node.js, Express 4 |
| Database | MongoDB, Mongoose 8 |
| Authentication | JSON Web Tokens, bcryptjs, cookie-parser |
| Payments | Razorpay Checkout and Orders API, Test Mode only |

## Project structure

```text
shopkart-mern/
├── backend/
│   ├── controllers/       # Authentication, products, wishlist, cart, orders
│   ├── middlewares/       # Authentication and admin access checks
│   ├── models/            # Customer, Product, and Order schemas
│   ├── routes/            # Express API routes
│   ├── scripts/           # Admin account promotion
│   ├── utils/             # JWT and cookie helpers
│   ├── .env.example
│   ├── index.js           # API entry point and database connection
│   └── package.json
├── frontend/
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # Navigation, search, and product cards
│   │   ├── context/       # Cart and wishlist state
│   │   ├── pages/         # Storefront, checkout, orders, and admin pages
│   │   ├── services/      # API client
│   │   ├── utils/         # Product image helpers
│   │   ├── App.jsx        # Routing and session handling
│   │   └── main.jsx       # React entry point
│   ├── .env.example
│   └── package.json
├── .gitignore
├── package.json           # Commands for both applications
└── README.md
```

## Getting started

### Prerequisites

- Node.js 22+ and npm.
- A MongoDB database. **Checkout requires a replica set or a transaction-capable Atlas cluster**, because payment verification uses a database transaction. A standalone local MongoDB instance is insufficient for the complete checkout flow.
- Razorpay Test Mode API credentials to try checkout. Browsing, authentication, and inventory management do not require payment credentials.

### 1. Install dependencies

Open a terminal in the project root and run:

```bash
npm run install:all
```

### 2. Configure environment variables

Copy the example files, or create the corresponding `.env` files manually:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Set the following in `backend/.env`:

```env
PORT=5001
JWT_SECRET=replace_with_a_long_random_value
MONGO_URI=mongodb://127.0.0.1:27017/shopkart?replicaSet=rs0
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_test_key_secret
```

The MongoDB URI above assumes you have already initialized a local replica set named `rs0`. Adding `replicaSet=rs0` to a URI does not create a replica set. Replace the URI with your own database connection string if using Atlas or a differently configured database.

Set the following in `frontend/.env`:

```env
VITE_API_URL=http://localhost:5001
```

Use your own JWT secret and Razorpay test credentials. Only Razorpay key IDs beginning with `rzp_test_` are accepted. Keep the Razorpay secret in the backend environment; the frontend receives the public key ID when checkout starts.

Local `.env` files are excluded by `.gitignore`; the `.env.example` files are included for setup reference.

### 3. Start the application

Run the backend in one terminal:

```bash
npm run dev:backend
```

Run the frontend in another terminal, also from the project root:

```bash
npm run dev:frontend
```

| Service | Default URL |
| --- | --- |
| Storefront | http://localhost:5173 |
| Backend API and database status | http://localhost:5001 |

Check that the backend reports a successful MongoDB connection before using the application.

### 4. Create an admin and add products

New accounts receive the customer role. To set up the catalog:

1. Register an account through the application.
2. Run the following command from the project root, using that account's email:

   ```bash
   npm --prefix backend run make-admin -- your-email@example.com
   ```

3. Sign out and sign in again.
4. Open **Admin** in the navigation bar, or visit `http://localhost:5173/admin/products`.
5. Add products with a name, description, category, image URL, price, and opening stock.

The catalog starts empty on a new database. The admin dashboard also supports editing products, adding stock, and deleting products. Product management routes enforce admin access on the backend.

## Checkout flow

1. Sign in, add available products to the cart, and choose **Proceed to Checkout**.
2. Enter a shipping address, including a phone number containing 10–15 digits and a six-digit pincode.
3. The backend checks stock, calculates the total from stored product prices, snapshots the items, and creates a Razorpay test order.
4. Complete the test payment in Razorpay Checkout.
5. The backend verifies the payment signature and uses a MongoDB transaction to reduce stock, mark the order as paid and placed, and clear the cart.
6. View the confirmation page or open **My Orders**.

The cart is cleared only after successful verification and completion of the transaction. Repeated verification of a completed order does not deduct stock again. Checkout uses Test Mode only; live payment credentials are rejected.

## API reference

The default API base URL is `http://localhost:5001`. Routes marked **Signed in** require authentication; **Admin** routes additionally require the admin role.

| Method | Route | Purpose | Access |
| --- | --- | --- | --- |
| `GET` | `/` | API and database status | Public |
| `POST` | `/customers/register` | Register an account | Public |
| `POST` | `/customers/login` | Sign in and set an authentication cookie | Public |
| `POST` | `/customers/logout` | Clear the authentication cookie | Public |
| `GET` | `/customers/me` | Get the current user's profile | Signed in |
| `GET` | `/products` | List, search, filter, and sort products | Public |
| `GET` | `/products/:id` | Get product details | Public |
| `POST` | `/products` | Create a product | Admin |
| `PATCH` | `/products/:id` | Edit a product | Admin |
| `PATCH` | `/products/:id/stock` | Add stock | Admin |
| `DELETE` | `/products/:id` | Delete a product | Admin |
| `GET` | `/wishlist` | Get the wishlist | Signed in |
| `POST` | `/wishlist/:productId` | Add a product to the wishlist | Signed in |
| `DELETE` | `/wishlist/:productId` | Remove a wishlist product | Signed in |
| `GET` | `/cart` | Get the cart | Signed in |
| `POST` | `/cart/:productId` | Add one unit of a product | Signed in |
| `PATCH` | `/cart/:productId` | Set a product's quantity | Signed in |
| `DELETE` | `/cart/:productId` | Remove a cart product | Signed in |
| `POST` | `/orders/create-payment-order` | Validate the cart and create a test payment order | Signed in |
| `POST` | `/orders/verify-payment` | Verify payment and place the order | Signed in |
| `GET` | `/orders` | Get the current user's order history | Signed in |
| `GET` | `/orders/:id` | Get an order owned by the current user | Signed in |

Product queries support `search`, `category`, and `sort=price_asc` or `sort=price_desc`. For example:

```text
GET /products?search=phone&category=electronics&sort=price_asc
```

## Available commands

Run these commands from the project root:

| Command | Purpose |
| --- | --- |
| `npm run install:all` | Install frontend and backend dependencies |
| `npm run dev:backend` | Start the backend with file watching |
| `npm run dev:frontend` | Start the Vite development server |
| `npm run start:backend` | Start the backend without file watching |
| `npm run build:frontend` | Build the frontend into `frontend/dist/` |
| `npm --prefix frontend run preview` | Preview an existing frontend build locally |
| `npm --prefix backend run make-admin -- your-email@example.com` | Promote an existing account to admin |

The frontend build contains the client application; the Express API and MongoDB must run separately.

## Verification

Check that the frontend compiles:

```bash
npm run build:frontend
```

Check backend JavaScript syntax in a Bash or Zsh terminal:

```bash
for file in backend/index.js backend/models/*.js backend/controllers/*.js backend/routes/*.js backend/middlewares/*.js backend/scripts/*.js backend/utils/*.js; do
  node --check "$file" || break
done
```

These checks validate compilation and syntax. To verify the full application, register and sign in, add products as an admin, update a wishlist and cart, complete a test checkout, and confirm the resulting order and stock changes. No automated test suite is currently configured.

## Troubleshooting

| Issue | What to check |
| --- | --- |
| Empty catalog | Add products through the admin dashboard on a new database. |
| MongoDB connection error | Confirm that the database is running and `MONGO_URI` points to the correct database. |
| Transaction error during payment verification | Use a MongoDB replica set or a transaction-capable Atlas cluster instead of standalone MongoDB. |
| Checkout reports missing or invalid credentials | Set both Razorpay variables in `backend/.env` and use a key ID beginning with `rzp_test_`. Restart the backend after changes. |
| Frontend cannot reach the API | Confirm the backend port and `VITE_API_URL` match. Restart Vite after changing frontend environment variables. |
| Admin link is missing | Promote the registered account with `make-admin`, then sign out and sign in again. |
