# Admin Dashboard Setup

## Overview
The admin dashboard allows website owners to manage products, view orders, and access admin-only features.

## Making a User an Admin

To make a user an admin, run this command in the backend directory:

```bash
cd backend
npm run make-admin user@example.com
```

Replace `user@example.com` with the email of the user you want to make an admin.

## Admin Features

### Dashboard Tab
- View statistics:
  - Total Products
  - Total Orders
  - Total Users
  - Total Revenue

### Products Tab
- View all products with details
- Add new products
- Edit existing products
- Delete products

### Orders Tab
- View all orders (coming soon)
- Manage order status (coming soon)

## Accessing the Admin Dashboard

1. Log in with an admin account
2. Click "Admin" in the navigation menu (only visible to admins)
3. Or navigate directly to `/admin`

## Security

- All admin routes are protected by authentication middleware
- Only users with `isAdmin: true` can access admin features
- Non-admin users are automatically redirected if they try to access `/admin`

## API Endpoints

All admin endpoints are prefixed with `/api/admin`:

- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/products` - Get all products (admin view)
- `POST /api/admin/products` - Create new product
- `PUT /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product
- `GET /api/admin/orders` - Get all orders
- `PUT /api/admin/users/:id/make-admin` - Make user admin

