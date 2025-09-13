# NurseryMart - Plant Selling Web App

A complete responsive plant-selling web application with role-based authentication (Buyer, Seller, Admin) built with modern web technologies.

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript, Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: MongoDB with Mongoose ORM
- **Authentication**: JWT with bcrypt password hashing
- **Deployment**: Netlify (Frontend) + Render (Backend)

## Features

- 🌱 **Splash Screen** with auto-redirect
- 🏠 **Home Page** with categories and featured plants
- 📱 **Responsive Design** (mobile-first approach)
- 🔐 **Role-based Authentication** (Buyer, Seller, Admin)
- 🛒 **Shopping Cart** and checkout system
- 📊 **Seller Dashboard** for product management
- ⚙️ **Admin Dashboard** for system management
- 🎨 **Modern UI** with Tailwind CSS

## Project Structure

```
E-commerce/
├── frontend/          # Frontend files (HTML, CSS, JS)
├── backend/           # Backend Node.js + Express API
├── .env.example       # Environment variables template
└── README.md          # This file
```

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB database
- Git

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Configuration:**
   - Copy `.env.example` to `.env`
   - Update the following variables:
     ```
     MONGODB_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret_key
     PORT=5000
     ```

4. **Start the server:**
   ```bash
   npm start
   ```
   
   The backend will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```
   
   The frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (Seller/Admin only)
- `PUT /api/products/:id` - Update product (Seller/Admin only)
- `DELETE /api/products/:id` - Delete product (Seller/Admin only)

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update` - Update cart item quantity
- `DELETE /api/cart/remove/:productId` - Remove item from cart

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id/status` - Update order status (Seller/Admin only)

## Role-based Access Control

- **Buyer**: Browse products, manage cart, place orders, view order history
- **Seller**: Manage own products, view orders for their products
- **Admin**: Full system access, manage all products/users/orders

## Deployment

### Frontend (Netlify)
1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify
3. Update API base URL to your backend URL

### Backend (Render)
1. Connect your GitHub repository to Render
2. Set environment variables in Render dashboard
3. Deploy the backend service

## Local Development

- Backend runs on port 5000
- Frontend runs on port 3000
- Ensure MongoDB is running locally or use MongoDB Atlas

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
