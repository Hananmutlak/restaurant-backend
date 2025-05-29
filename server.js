require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const productRoutes = require('./routes/products');
const bookingRoutes = require('./routes/bookings');
const authRoutes = require('./routes/auth');

const app = express();

// 1. إعدادات CORS المحدثة
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:3000', 'http://127.0.0.1:5501'];

console.log('🔒 Allowed origins:', allowedOrigins);

const corsOptions = {
  origin: function (origin, callback) {
    // السماح بطلبات بدون أصل (مثل Postman)
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

// 6. صفحة الترحيب المعدلة
app.get('/', (req, res) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Restaurant API</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        h1 { color: #2c3e50; }
        ul { list-style: none; padding: 0; }
        li { margin: 10px 0; padding: 10px; background: #f8f9fa; border-radius: 5px; }
        .origin { display: inline-block; padding: 3px 8px; background: #e9ecef; border-radius: 3px; font-family: monospace; }
      </style>
    </head>
    <body>
      <h1>Restaurant Management API</h1>
      <p>API is running successfully</p>
      
      <h2>Allowed Origins:</h2>
      <ul>
        ${allowedOrigins.map(origin => `<li><span class="origin">${origin}</span></li>`).join('')}
      </ul>
      
      <h2>Available Endpoints:</h2>
      <ul>
        <li>POST /api/auth/login - User login</li>
        <li>GET /api/bookings - Get all bookings</li>
        <li>GET /api/products - Get all products</li>
      </ul>
      
      <p><strong>Current time:</strong> ${new Date().toLocaleString()}</p>
    </body>
    </html>
  `;
  
  res.send(html);
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

// 8. اتصال قاعدة البيانات
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