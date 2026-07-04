import express, { Router } from 'express';
import ServiceStatusController from '../controllers/service-status.controller';

const router: Router = express.Router();

router.get('/', ServiceStatusController.getServiceStatuses);
router.post('/', ServiceStatusController.createServiceStatus);
router.get('/:serviceStatusId', ServiceStatusController.getServiceStatusById);
router.patch('/:serviceStatusId', ServiceStatusController.updateServiceStatus);
router.delete('/:serviceStatusId', ServiceStatusController.deleteServiceStatus);

export default router;
