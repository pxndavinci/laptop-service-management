import express from 'express';
import { Router } from 'express';
import userRouter from './user.routes';
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

router.use('/user', userRouter);

// Contacts
router.use('/contact', contactRouter);

// Products
router.use('/product', productRouter);

// Service Orders
router.use('/service-order', serviceOrderRouter);

// Service Timelines
router.use('/service-timeline', servicetimelineRouter);

// References
router.use('/reference', referenceRouter);

export default router;
