import express from 'express';
import { sql } from 'kysely';
import db from '../db/index';
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

// Liveness + database reachability; used by the container healthcheck and deploys
router.get('/health', async (_req, res) => {
  try {
    await sql`select 1`.execute(db);
    res.status(200).send('OK');
  } catch {
    res.status(503).send('Database unavailable');
  }
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
