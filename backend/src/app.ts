import 'express-async-errors';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import createDebug from 'debug';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swaggerConfig'; 
import indexRouter from './route/index';
import api from './config/openAPIBackend';
import { errorMiddleware } from './middlewares/error.middleware';

api.init();
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/', indexRouter);

app.use(errorMiddleware);

// Server initialization
const port: number = parseInt(process.env.PORT || '3000', 10);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Swagger UI available at http://localhost:${port}/api-docs`);
});

module.exports = app;
