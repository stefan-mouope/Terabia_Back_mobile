// require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const sequelize = require('./config/sequelize');
const config = require('./config/config');

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// ====================== MIDDLEWARES ======================

// CORS → essentiel pour mobile / web
app.use(cors({
  origin: '*', // Autorise toutes les origines en dev, à restreindre en prod
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: false
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logger Morgan custom
app.use(
  morgan((tokens, req, res) => {
    const status = tokens.status(req, res);
    const color =
      status >= 500 ? 31 :
      status >= 400 ? 33 :
      status >= 300 ? 36 :
      status >= 200 ? 32 : 0;

    return [
      '\x1b[35m➜\x1b[0m',
      '\x1b[1m' + tokens.method(req, res) + '\x1b[0m',
      tokens.url(req, res),
      `\x1b[${color}m${status}\x1b[0m`,
      tokens['response-time'](req, res) + 'ms',
      '\x1b[90mfrom\x1b[0m',
      req.ip.replace('::ffff:', ''),
      '\x1b[90m@\x1b[0m',
      new Date().toLocaleTimeString()
    ].join(' ');
  })
);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Terabia API is running perfectly!',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth/login',
      users: '/api/users',
      products: '/api/products'
    }
  });
});

// ====================== ROUTES ======================
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/reviews', reviewRoutes);

// ====================== ERROR HANDLERS ======================
app.use(notFound);
app.use(errorHandler);

// ====================== SERVER START ======================
const PORT = config.PORT || 3000;

const startServer = async () => {
  try {
    console.log("🔌 Attempting DB connection...");
    await sequelize.authenticate();
    console.log("✅ Database connection established!");

    // ❗ alter: true → uniquement en développement
    await sequelize.sync();
    console.log("🔄 Models synchronized.");

    app.listen(PORT, '0.0.0.0', () => {
      console.log("\n🎉 Server started successfully!\n");
      console.log(`   🌍 Localhost:           http://localhost:${PORT}`);
      console.log(`   📱 Real Android phone:  http://${config.LOCAL_IP}:${PORT}`);
      console.log(`   📱 Genymotion:          http://10.0.3.2:${PORT}`);
      console.log(`   🐳 Android Studio:      http://10.0.2.2:${PORT}\n`);
      console.log("   ⏻ Stop server: Ctrl+C\n");
    });

  } catch (error) {
    console.error("💥 Server failed to start:", error);
    process.exit(1);
  }
};

startServer();
