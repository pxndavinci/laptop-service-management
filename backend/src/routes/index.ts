import express from 'express';
import { Router } from 'express';
import userRouter from './user.routes';
import contactRouter from './contact.routes';
import productRouter from './product.routes';
import userProductRouter from './user-product.routes';
import serviceOrderRouter from './service-order.routes';
import serviceStatusRouter from './service-status.routes';
import referenceRouter from './reference.routes';
import serviceOrderComposerRouter from './service-order-composer.routes';

const router: Router = express.Router();

/* Index */

router.get('/health', function(req, res, next) {
  res.status(200).send('OK');
});

// Users
router.use('/users', userRouter);

// Contacts
router.use('/contacts', contactRouter);

// Products
router.use('/products', productRouter);

// User Products
router.use('/user-products', userProductRouter);

// Service Orders
router.use('/service-orders', serviceOrderRouter);

// Service Order Composer
router.use('/service-order-composer', serviceOrderComposerRouter);

// Service Status
router.use('/service-status', serviceStatusRouter);

// References
router.use('/references', referenceRouter);

export default router;
