import { Request, Response } from 'express';
import dashboardService from '../services/dashboard.service';

const DashboardController = {
  getMetrics: async (_req: Request, res: Response) => {
    res.status(200).json(await dashboardService.getMetrics());
  },
};

export default DashboardController;
