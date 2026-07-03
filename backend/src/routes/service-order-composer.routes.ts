import express, { Router } from 'express';
import ServiceOrderComposerController from '../controllers/service-order-composer.controller';

const router: Router = express.Router();

router.get('/search', ServiceOrderComposerController.getSearchResults);
router.post('/submit', ServiceOrderComposerController.composeServiceOrder);

export default router;
