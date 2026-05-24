import express, { Router } from 'express';
import ServiceOrderController from '../controllers/service-order.controller';

const router: Router = express.Router();

/* Service orders endpoints */
router.get('/', ServiceOrderController.getServiceOrders);
router.post('/', ServiceOrderController.createServiceOrder);
router.get('/:serviceOrderId', ServiceOrderController.getServiceOrderById);
router.patch('/:serviceOrderId', ServiceOrderController.updateServiceOrder);
router.delete('/:serviceOrderId', ServiceOrderController.deleteServiceOrder);

export default router;