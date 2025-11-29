require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/users.routes');
const productRoutes = require('./routes/products.routes');
const orderRoutes = require('./routes/orders.routes');
const paymentRoutes = require('./routes/payments.routes');
const deliveryRoutes = require('./routes/deliveries.routes');
const adminRoutes = require('./routes/admin.routes');

app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.send('Terabia API is running!');
});

// Auth Routes
// app.use('/api/auth', authRoutes);
// User Routes
app.use('/api/users', userRoutes);
// Product Routes
app.use('/api/products', productRoutes);
// Order Routes
app.use('/api/orders', orderRoutes);
// Payment Routes
app.use('/api/payments', paymentRoutes);
// Delivery Routes
app.use('/api/deliveries', deliveryRoutes);
// Admin Routes
app.use('/api/admin', adminRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
