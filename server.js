require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const productRoutes = require('./routes/products');
const bookingRoutes = require('./routes/bookings');
const authRoutes = require('./routes/auth');

const app = express();

// 1. حل مشكلة CORS بشكل نهائي
const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim());

const corsOptions = {
  origin: function (origin, callback) {
    // السماح لطلبات Postman وcurl (بدون origin)
    if (!origin) return callback(null, true);
    
    // السماح للمصادر المسجلة
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS Rejected: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

// 2. معالجة طلبات OPTIONS
app.options('*', cors(corsOptions));

// 3. تطبيق CORS
app.use(cors(corsOptions));

// 4. الميدل وير الأساسية
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 5. تعريف الراوتس
app.use('/api/products', productRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/auth', authRoutes);

// 6. صفحة الترحيب
app.get('/', (req, res) => {
  res.send(`
    <h1>Restaurant Management API</h1>
    <p>API is running successfully</p>
    <h2>Allowed Origins:</h2>
    <ul>
      ${allowedOrigins.map(origin => `<li>${origin}</li>`).join('')}
    </ul>
    <h2>Available Endpoints:</h2>
    <ul>
      <li>POST /api/auth/login - User login</li>
      <li>GET /api/bookings - Get all bookings</li>
      <li>GET /api/products - Get all products</li>
    </ul>
  `);
});


// 5. التحكم في الأخطاء
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation Error',
      details: err.message
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      message: 'Invalid ID format'
    });
  }

  // خطأ CORS
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      message: 'CORS Error: Origin not allowed'
    });
  }

  res.status(500).json({ message: 'Internal Server Error' });
});

// 6. اتصال قاعدة البيانات
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000
})
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch(err => {
  console.error('❌ MongoDB Atlas connection error:', err);
  process.exit(1);
});

// 9. تشغيل السيرفر
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log('🔒 Allowed origins:', allowedOrigins);
});