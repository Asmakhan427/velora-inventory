const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const { ensureSchema } = require('./db/connection');
const { attachUserIfPresent } = require('./middleware/auth');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const productRoutes = require('./routes/productRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

ensureSchema();

const app = express();

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(morgan(process.env.NODE_ENV === 'test' ? 'tiny' : 'dev'));
app.use(attachUserIfPresent);

// Root Route
app.get('/', (req, res) => {
  res.json({
    message: 'Velora Inventory API is running ',
    health: '/api/health'
  });
});

// Health Route
app.get('/api/health', (req, res) => {
  res.json({
    data: {
      status: 'ok',
      time: new Date().toISOString()
    }
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/products', productRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Export app
module.exports = app;
