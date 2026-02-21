# Firestore Security Rules Deployment

The app now requires proper Firestore security rules to function. These rules allow:
- Authenticated users to read user data (needed for login to fetch role)
- Users to read products and categories
- Users to manage their own carts and orders
- Admins to manage products, categories, and view all orders

## Deploy Rules to Firebase

1. **Install Firebase CLI** (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Deploy the rules**:
   ```bash
   firebase deploy --only firestore:rules
   ```

After deployment, the app should work correctly with proper authentication and authorization.

## Rules Overview

- `/users/{userId}` - Users can read their own document; any authenticated user can read to fetch role during login
- `/products/{productId}` - Readable by authenticated users; writable by admins
- `/categories/{categoryId}` - Readable by authenticated users; writable by admins
- `/carts/{cartId}` - Users can manage only their own cart
- `/orders/{orderId}` - Users can only read their own orders; admins can read all orders

All other paths are denied by default for security.
