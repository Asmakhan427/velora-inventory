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

const app = express();   // ← THIS LINE MUST EXIST

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(morgan(process.env.NODE_ENV === 'test' ? 'tiny' : 'dev'));
app.use(attachUserIfPresent);
