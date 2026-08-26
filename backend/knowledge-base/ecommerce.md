# E-Commerce Application Development

## Category: E-commerce

## Core Domain Entities
Product: id, name, description, price, compareAtPrice, sku, stock, images, category, tags, status
Category: id, name, slug, parentId, description, image
Cart: id, userId (nullable for guests), items, subtotal, discount, createdAt
CartItem: id, cartId, productId, quantity, price (snapshot at time of adding)
Order: id, userId, status, items, subtotal, tax, shipping, total, address, paymentIntentId
OrderItem: id, orderId, productId, title, price, quantity
Address: id, userId, street, city, state, country, zip, isDefault
Payment: id, orderId, provider, amount, currency, status, transactionId

## Product Management
Implement product catalog with search, filtering, and sorting.
Support product variants (size, color) as separate SKUs.
Implement inventory tracking with low-stock alerts.
Support product images with multiple angles.
Add product reviews and ratings.
Implement related products recommendation.
Add product bundles and upsells.

## Shopping Cart
Implement persistent cart (saved to database for logged-in users).
Support guest cart with session-based storage.
Merge guest cart with user cart on login.
Calculate taxes based on shipping address.
Apply coupon codes and discounts.
Show inventory availability in real-time.
Handle out-of-stock items in cart gracefully.

## Checkout Process
Multi-step checkout: Cart Review → Shipping → Payment → Confirmation.
Save shipping addresses for logged-in users.
Support multiple payment methods: credit card, PayPal.
Integrate Stripe for payment processing.
Send order confirmation email after purchase.
Handle payment failures gracefully with retry.
Implement 3D Secure authentication support.

## Payment Integration (Stripe)
Use Stripe Payment Intents API for reliable payment processing.
Create payment intent on server, confirm on client.
Handle webhook events for asynchronous payment updates.
Implement idempotency keys to prevent duplicate charges.
Store payment method for repeat customers (with consent).
Handle refunds through Stripe API.

## Order Management
Order statuses: pending, confirmed, processing, shipped, delivered, cancelled, refunded.
Send email notifications on status changes.
Implement order tracking with shipping provider integration.
Allow order cancellation within a time window.
Handle partial fulfillment for multi-item orders.
Generate invoices as PDF.

## Admin Dashboard
Product management: CRUD with bulk operations.
Order management: view, update status, process refunds.
Customer management: view profiles, order history.
Inventory management: stock levels, alerts.
Analytics: revenue, orders, top products, conversion rate.
Discount and coupon management.

## SEO and Performance
Implement server-side rendering or static generation for product pages.
Use canonical URLs for product variants.
Implement structured data (JSON-LD) for products.
Optimize images with WebP format and lazy loading.
Implement product page caching.
Use a CDN for static assets.

## Key Implementation Tasks
- Product catalog with search and filtering
- Product detail page with image gallery
- Shopping cart (state management + API)
- Cart persistence and sync
- User registration and authentication
- Checkout flow with address management
- Stripe payment integration
- Order creation and management
- Order confirmation emails
- Admin product management
- Admin order management
- Inventory tracking
- Basic analytics dashboard
