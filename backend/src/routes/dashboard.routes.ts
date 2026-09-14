import express, { Router } from 'express';
import DashboardController from '../controllers/dashboard.controller';

const router: Router = express.Router();

router.get('/metrics', DashboardController.getMetrics);

export default router;
