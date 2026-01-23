import express from 'express';
import { Router } from 'express';
import indexRouter from './user.routes';
import contactRouter from './contact.routes';
import productRouter from './product.routes';
import serviceOrderRouter from './service-order.routes';
import servicetimelineRouter from './service-timeline.routes';
import referenceRouter from './reference.routes';

const router: Router = express.Router();

/* Index */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'KS Technologies' });
});

router.get('/health', function(req, res, next) {
  res.status(200).send('OK');
});

// Users

router.get('/users', function(req, res, next) {
  router.use('/users', indexRouter);
  next();
});

// Contacts
router.get('/contacts', function(req, res, next) {
  router.use('/contacts', contactRouter);
  next();
});

// Products
router.get('/products', function(req, res, next) {
  router.use('/products', productRouter);
  next();
});

// Service Orders
router.get('/service-orders', function(req, res, next) {
  router.use('/service-orders', serviceOrderRouter);
  next();
});

// Service Timelines
router.get('/service-timelines', function(req, res, next) {
  router.use('/service-timelines', servicetimelineRouter);
  next();
});

// References
router.get('/references', function(req, res, next) {
  router.use('/references', referenceRouter);
  next();
});

export default router;
