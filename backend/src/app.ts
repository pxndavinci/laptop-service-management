import 'express-async-errors';
import express from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import * as OpenApiValidator from 'express-openapi-validator';
import yaml from 'yaml';
import router from './routes/index';
import { errorMiddleware } from './middlewares/error.middleware';
import { requireAuth } from './middlewares/auth.middleware';
import { env } from './config/env';

const openApiPath = path.join(__dirname, 'openapi/openapi.yaml');
const openApiDocument = yaml.parse(fs.readFileSync(openApiPath, 'utf8'));

const app = express();

if (env.trustProxy) {
  // Behind nginx: trust X-Forwarded-For from the first hop for real client IPs
  app.set('trust proxy', 1);
}
app.disable('x-powered-by');

app.use(
  cors({
    origin: env.corsOrigin,
    credentials: true,
  })
);
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

// Per-IP ceiling for the whole API, ahead of the session check (which hits the
// database). Far above normal use: a dashboard load is ~5 requests.
app.use(
  rateLimit({
    windowMs: 5 * 60 * 1000,
    limit: 1000,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    skip: (req) => req.path === '/health',
    message: { error: 'Too many requests. Slow down and try again shortly.' },
  })
);

// Every route needs a staff session except these. Checked before validation so
// anonymous callers learn nothing about the API beyond "log in".
const PUBLIC_PATHS = /^\/(health|api-docs|auth\/login|auth\/logout)(\/|$)/;
app.use((req, res, next) => (PUBLIC_PATHS.test(req.path) ? next() : requireAuth(req, res, next)));

// Validate requests against the OpenAPI contract before they reach controllers
app.use(
  OpenApiValidator.middleware({
    apiSpec: openApiPath,
    validateRequests: true,
    validateResponses: false,
    // Sessions are checked by requireAuth; the spec documents them for Swagger UI
    validateSecurity: false,
    ignorePaths: /^\/(health|api-docs)/,
  })
);

app.use('/', router);

app.use(errorMiddleware);

export default app;
