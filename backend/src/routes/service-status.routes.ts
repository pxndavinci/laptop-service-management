import express, { Router } from 'express';
import ServiceTimelineController from '../controllers/service-status.controller';

const router: Router = express.Router();

/* Service status endpoints */
router.get('/', ServiceTimelineController.getServiceTimelines);
router.post('/', ServiceTimelineController.createServiceStatus);
router.get('/:serviceStatusId', ServiceTimelineController.getServiceStatusById);
router.patch('/:serviceStatusId', ServiceTimelineController.updateServiceStatus);
router.delete('/:serviceStatusId', ServiceTimelineController.deleteServiceStatus);

export default router;