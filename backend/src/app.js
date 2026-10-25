
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import routes from './routes/index.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const app = express();

// Render reverse proxy configuration
app.set('trust proxy', 1);

app.disable('x-powered-by');

app.use(helmet());

app.use(
  cors({
    origin: env.clientOrigin.split(',').map((s) => s.trim()),
    credentials: false,
  })
);

app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false, limit: '20kb' }));

// General API rate limiter
app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// Login-specific rate limiter
app.use(
  '/api/auth/login',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 15,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: {
        message: 'Too many login attempts. Please try again later.',
      },
    },
  })
);

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

export default app;
