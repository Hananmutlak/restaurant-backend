// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

const productRoutes = require('./routes/products');
const bookingRoutes = require('./routes/bookings');
const authRoutes = require('./routes/auth');

const app = express();

// 1. Middleware for security and logging
app.use(helmet()); // Security headers
app.use(morgan('dev')); // Request logging

// 2. Rate limiting to prevent brute force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});
app.use(limiter);

// 3. CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:3000'];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
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
app.use(cors(corsOptions));

// 4. Body parsing middleware
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 5. Welcome route
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Restaurant Management API</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        h1 { color: #2c3e50; }
        ul { list-style: none; padding: 0; }
        li { margin: 10px 0; padding: 10px; background: #f8f9fa; border-radius: 5px; }
        .method { display: inline-block; width: 80px; font-weight: bold; }
        .get { color: #2ecc71; }
        .post { color: #3498db; }
        .patch { color: #f39c12; }
        .delete { color: #e74c3c; }
      </style>
    </head>
    <body>
      <h1>Restaurant Management API</h1>
      <p>API is running successfully</p>
      
      <h2>Available Endpoints:</h2>
      <ul>
        <li><span class="method get">GET</span> /api/bookings - Get all bookings</li>
        <li><span class="method post">POST</span> /api/bookings - Create new booking</li>
        <li><span class="method get">GET</span> /api/products - Get all products</li>
        <li><span class="method post">POST</span> /api/auth/login - User login</li>
        <li><span class="method post">POST</span> /api/auth/register - Register new user</li>
      </ul>
      
      <p>For testing login, use POST request to /api/auth/login with JSON body:</p>
      <pre>{
  "email": "admin@example.com",
  "password": "yourpassword"
}</pre>
    </body>
    </html>
  `);
});

// 6. API routes
app.use('/api/products', productRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/auth', authRoutes);

// 7. Route for testing login form
app.get('/login-test', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Login Test</title>
    </head>
    <body>
      <h2>API Login Test Form</h2>
      <form id="loginForm">
        <input type="email" id="email" placeholder="Email" required><br>
        <input type="password" id="password" placeholder="Password" required><br>
        <button type="submit">Login</button>
      </form>
      <div id="result"></div>
      
      <script>
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          
          const email = document.getElementById('email').value;
          const password = document.getElementById('password').value;
          
          try {
            const response = await fetch('/api/auth/login', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
              document.getElementById('result').innerHTML = '<p style="color:green">Login successful! Token received.</p>';
              console.log('Token:', data.token);
            } else {
              document.getElementById('result').innerHTML = '<p style="color:red">Error: ' + (data.message || 'Login failed') + '</p>';
            }
          } catch (error) {
            document.getElementById('result').innerHTML = '<p style="color:red">Network error: ' + error.message + '</p>';
          }
        });
      </script>
    </body>
    </html>
  `);
});

// 8. 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.method} ${req.originalUrl} on this server`
  });
});

// 9. Global error handler
app.use((err, req, res, next) => {
  console.error('ERROR:', err);
  
  // Specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'fail',
      message: 'Validation Error',
      errors: err.errors
    });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({
      status: 'fail',
      message: 'Invalid ID format'
    });
  }
  
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      status: 'fail',
      message: 'CORS Error: Origin not allowed'
    });
  }
  
  // Generic error response
  res.status(err.statusCode || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error'
  });
});

// 10. Database connection
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

// 11. Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log('🔒 Allowed origins:', allowedOrigins);
  console.log(`🌐 Test login form: http://localhost:${PORT}/login-test`);
});

// 12. Handle unhandled rejections
process.on('unhandledRejection', err => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err);
  server.close(() => {
    process.exit(1);
  });
});

// 13. Handle uncaught exceptions
process.on('uncaughtException', err => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err);
  server.close(() => {
    process.exit(1);
  });
});