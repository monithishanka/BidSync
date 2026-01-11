require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const rfqRoutes = require('./routes/rfq');
const bidRoutes = require('./routes/bid');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');
const notificationRoutes = require('./routes/notification');

const app = express();

// Trust proxy - REQUIRED for secure cookies behind Render's load balancer
app.set('trust proxy', 1);

// Connect to MongoDB
connectDB();

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://bidsync.online',
  'https://www.bidsync.online',
  'https://bidsync-client.onrender.com', // Add your Render static site URL if you have one
  process.env.CLIENT_URL
].filter(Boolean);

console.log('CORS allowed origins:', allowedOrigins);
console.log('NODE_ENV:', process.env.NODE_ENV);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, Postman, or server-to-server)
    if (!origin) {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.log('CORS blocked origin:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    ttl: 24 * 60 * 60 // 1 day
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    domain: process.env.NODE_ENV === 'production' ? '.bidsync.online' : undefined
  }
}));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/rfq', rfqRoutes);
app.use('/api/bid', bidRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'BidSync API is running' });
});

// Note: Static files are served from a separate Render Static Site
// This API server only handles /api/* routes

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
