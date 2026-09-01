require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const outpassRoutes = require('./routes/outpassRoutes');
const parentRoutes = require('./routes/parentRoutes');
const visitPassRoutes = require('./routes/visitPassRoutes');
const adminRoutes = require('./routes/adminRoutes');
const verifyRoutes = require('./routes/verifyRoutes');

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/outpasses', outpassRoutes);
app.use('/api/parents', parentRoutes);
app.use('/api/visit-passes', visitPassRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/verify', verifyRoutes);

// Test Endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Hostel Pass Management System API is running.' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: err.message || 'An unexpected server error occurred',
    error: process.env.NODE_ENV === 'production' ? {} : err.stack
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
