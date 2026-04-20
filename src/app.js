const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const morgan = require('morgan');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');
const config = require('./config');
const logger = require('./utils/logger');
const { globalRateLimiter } = require('./middlewares/rateLimiter');

const app = express();

// ── Security headers ─────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(cors(config.cors));

// ── Body parsing (limit payload size to prevent DoS) ─────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ── Data sanitization: block NoSQL injection ─────────────────────────────────
// express-mongo-sanitize v2 tidak kompatibel dengan Express v5 karena mencoba
// menulis req.query yang menjadi read-only getter di Express v5.
// Solusi: panggil mongoSanitize.sanitize() manual hanya pada body & params.
app.use((req, res, next) => {
  if (req.body) mongoSanitize.sanitize(req.body);
  if (req.params) mongoSanitize.sanitize(req.params);
  next();
});

// ── HTTP request logger ───────────────────────────────────────────────────────
if (config.env !== 'test') {
  app.use(
    morgan('combined', {
      stream: { write: (message) => logger.http(message.trim()) },
    })
  );
}

// ── Static assets (logo images for web pages) ───────────────────────────────
app.use('/assets', express.static(path.join(__dirname, 'templates/assets')));

// ── Global rate limiter ───────────────────────────────────────────────────────
app.use('/api', globalRateLimiter);

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/api', routes);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
