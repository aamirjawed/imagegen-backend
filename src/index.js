require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const { apiLimiter } = require('./middleware/rateLimiter');
const templateRoutes = require('./controllers/templateController');
const renderRoutes = require('./controllers/renderController');
const { startExpiryJob } = require('./jobs/expiryJob');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 4000;

// Security middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsers
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Static assets for template backgrounds/masks
app.use('/assets', express.static('templates', { maxAge: '1d' }));

// Rate limiting
app.use('/api/', apiLimiter);

// Routes
app.use('/api/templates', templateRoutes);
app.use('/api/render', renderRoutes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Global error handler
app.use((err, req, res, next) => {
  logger.error({ message: err.message, stack: err.stack, path: req.path });
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Internal server error' });
});

// Connect DB and start server
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/imagegen')
  .then(() => {
    logger.info('MongoDB connected');
    app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
    startExpiryJob();
  })
  .catch(err => {
    logger.error('MongoDB connection failed: ' + err.message);
    process.exit(1);
  });

module.exports = app;
