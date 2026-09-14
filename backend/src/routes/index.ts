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
import authRouter from './auth.routes';
import dashboardRouter from './dashboard.routes';

const router: Router = express.Router();

/* Index */

router.get('/health', (_req, res) => {
  res.status(200).send('OK');
});

// Auth (see PUBLIC_PATHS in app.ts for what is reachable without a session)
router.use('/auth', authRouter);

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

// Dashboard
router.use('/dashboard', dashboardRouter);

// References
router.use('/references', referenceRouter);

export default router;
