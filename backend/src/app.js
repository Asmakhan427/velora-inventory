app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(morgan(process.env.NODE_ENV === 'test' ? 'tiny' : 'dev'));
app.use(attachUserIfPresent);

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to Velora Inventory API",
    status: "Running",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      auth: "/api/auth",
      products: "/api/products",
      categories: "/api/categories",
      suppliers: "/api/suppliers",
      dashboard: "/api/dashboard"
    }
  });
});

app.get('/api/health', (req, res) =>
  res.json({
    data: {
      status: 'ok',
      time: new Date().toISOString()
    }
  })
);

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/products', productRoutes);
app.use('/api/dashboard', dashboardRoutes);