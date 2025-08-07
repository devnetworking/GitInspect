const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

module.exports = {
  applySecurity: (app) => {
    // Headers de sécurité
    app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "github.com"],
          connectSrc: ["'self'", "api.github.com", "api.deepseek.com"]
        }
      },
      hsts: {
        maxAge: 63072000,
        includeSubDomains: true,
        preload: true
      }
    }));

    // CORS restrictif
    app.use(cors({
      origin: process.env.ALLOWED_ORIGINS.split(','),
      methods: ['GET'],
      allowedHeaders: ['Content-Type']
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false
    });
    app.use(limiter);

    // Protection contre les attaques MITM
    app.use((req, res, next) => {
      res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      next();
    });
  }
};