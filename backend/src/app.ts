import 'express-async-errors';
import express from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import * as OpenApiValidator from 'express-openapi-validator';
import yaml from 'yaml';
import router from './routes/index';
import { errorMiddleware } from './middlewares/error.middleware';
import { env } from './config/env';

const openApiPath = path.join(__dirname, 'openapi/openapi.yaml');
const openApiDocument = yaml.parse(fs.readFileSync(openApiPath, 'utf8'));

const app = express();

app.use(
  cors({
    origin: env.corsOrigin,
    credentials: true,
  })
);
app.use(morgan('dev'));
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

// Validate requests against the OpenAPI contract before they reach controllers
app.use(
  OpenApiValidator.middleware({
    apiSpec: openApiPath,
    validateRequests: true,
    validateResponses: false,
    ignorePaths: /^\/(health|api-docs)/,
  })
);

app.use('/', router);

app.use(errorMiddleware);

export default app;
