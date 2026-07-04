import { Request, Response } from 'express';
import serviceStatusService from '../services/service-status.service';
import * as ServiceStatus from '../models/service-status.model';

const ServiceStatusController = {
  getServiceStatuses: async (req: Request, res: Response) => {
    const input: ServiceStatus.ServiceStatusQueryParams = {
      serviceOrderId: req.query.serviceOrderId as string | undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    };
    const result = await serviceStatusService.getServiceStatuses(input);
    res.status(200).json(result);
  },

  createServiceStatus: async (req: Request, res: Response) => {
    const input: ServiceStatus.CreateServiceStatus = {
      serviceOrderId: req.body.serviceOrderId,
      statusId: req.body.statusId,
      assignedTo: req.body.assignedTo,
      comment: req.body.comment,
      notifyCustomer: req.body.notifyCustomer,
    };
    const result = await serviceStatusService.createServiceStatus(input);
    res.status(201).json(result);
  },

  getServiceStatusById: async (req: Request, res: Response) => {
    const result = await serviceStatusService.getServiceStatusByID(req.params.serviceStatusId);
    res.status(200).json(result);
  },

  updateServiceStatus: async (req: Request, res: Response) => {
    const input: ServiceStatus.PatchServiceStatus = {
      statusId: req.body.statusId,
      assignedTo: req.body.assignedTo,
      comment: req.body.comment,
      notifyCustomer: req.body.notifyCustomer,
    };
    const result = await serviceStatusService.updateServiceStatus(
      req.params.serviceStatusId,
      input
    );
    res.status(200).json(result);
  },

  deleteServiceStatus: async (req: Request, res: Response) => {
    await serviceStatusService.deleteServiceStatus(req.params.serviceStatusId);
    res.status(204).send();
  },
};

export default ServiceStatusController;
