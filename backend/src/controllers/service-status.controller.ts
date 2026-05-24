import { Request, Response } from 'express';
import serviceStatusService from '../services/service-status.service';
import * as ServiceStatusModel from '../models/service-status.model';

const ServiceTimelineController = {
  getServiceTimelines: async (req: Request, res: Response) => {
    const input = {
      serviceOrderId: req.query.serviceOrderId as string | undefined,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
    };
    const result = await serviceStatusService.getServiceStatuses(input);
    res.status(200).json(result);
  },

  createServiceStatus: async (req: Request, res: Response) => {
    const input: ServiceStatusModel.CreateServiceStatus = {
      serviceOrderId: req.body.serviceOrderId as string,
      statusId: req.body.statusId as string,
      assignedTo: req.body.assignedTo as string,
      comment: req.body.comment as string | undefined,
      notifyCustomer: req.body.notifyCustomer as boolean | undefined,
    };
    const result = await serviceStatusService.createServiceStatus(input);
    res.status(201).json(result);
  },

  getServiceStatusById: async (req: Request, res: Response) => {
    const id: string = req.params.serviceStatusId[0];
    const result = await serviceStatusService.getServiceStatusByID(id);
    res.status(200).json(result);
  },

  updateServiceStatus: async (req: Request, res: Response) => {
    const input: ServiceStatusModel.PatchServiceStatus = {
      serviceOrderId: req.body.serviceOrderId as string | undefined,
      statusId: req.body.statusId as string | undefined,
      assignedTo: req.body.assignedTo as string | undefined,
      comment: req.body.comment as string | undefined,
      notifyCustomer: req.body.notifyCustomer as boolean | undefined,
    };
    const id: string = req.params.serviceStatusId[0];
    const result = await serviceStatusService.updateServiceStatus(id, input);
    res.status(200).json(result);
  },

  deleteServiceStatus: async (req: Request, res: Response) => {
    const id: string = req.params.serviceStatusId[0];
    const result = await serviceStatusService.deleteServiceStatus(id);
    res.status(200).json(result);
  },
};

export default ServiceTimelineController;
