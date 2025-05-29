require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const productRoutes = require('./routes/products');
const bookingRoutes = require('./routes/bookings');
const authRoutes = require('./routes/auth');

const app = express();

// 1. إعدادات CORS المخصصة
const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim());

const corsOptions = {
  origin: function (origin, callback) {
    // السماح بطلبات بدون أصل (مثل تطبيقات الجوال أو curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.get('/', (req, res) => {
  res.send(`
    <h1>Restaurant Management API</h1>
    <p>API is running successfully</p>
    <h2>Available Endpoints:</h2>
    <ul>
      <li>GET /api/bookings - Get all bookings</li>
      <li>POST /api/bookings - Create new booking</li>
      <li>GET /api/products - Get all products</li>
      <li>POST /api/auth/login - User login</li>
    </ul>
  `);
});

// 2. تطبيق إعدادات CORS
app.use(cors(corsOptions));

// 3. الميدل وير الأساسية
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. تعريف الراوتس
app.use('/api/products', productRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/auth', authRoutes);

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
  serverSelectionTimeoutMS: 10000, // زيادة وقت الانتظار
  socketTimeoutMS: 45000 // زيادة وقت المهلة
})
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch(err => {
  console.error('❌ MongoDB Atlas connection error:', err);
  process.exit(1); // إيقاف التطبيق في حالة فشل الاتصال
});

// 7. تشغيل السيرفر
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log('🔒 Allowed origins:', allowedOrigins);
});