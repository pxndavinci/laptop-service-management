import { Request, Response } from 'express';
import serviceOrderService from '../services/service-order.service';
import * as ServiceOrder from '../models/service-order.model';
import { IssueType, PaymentMethod, PaymentStatus } from '../db/schema';

const ServiceOrderController = {
  getServiceOrders: async (req: Request, res: Response) => {
    const input: ServiceOrder.ServiceOrderQueryParams = {
      tagNo: req.query.tagNo ? Number(req.query.tagNo) : undefined,
      userProductId: req.query.userProductId as string | undefined,
      paymentMethod: req.query.paymentMethod as PaymentMethod | undefined,
      paymentStatus: req.query.paymentStatus as PaymentStatus | undefined,
      priorityLevel: req.query.priorityLevel ? Number(req.query.priorityLevel) : undefined,
      issueDescription: req.query.issueDescription as IssueType | undefined,
      entryBy: req.query.entryBy as string | undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    };
    const result = await serviceOrderService.getServiceOrders(input);
    res.status(200).json(result);
  },

  createServiceOrder: async (req: Request, res: Response) => {
    const input: ServiceOrder.CreateServiceOrder = {
      userProductId: req.body.userProductId,
      estimatedPrice: req.body.estimatedPrice,
      priorityLevel: req.body.priorityLevel,
      estimatedCompletionDate: req.body.estimatedCompletionDate,
      issueDescription: req.body.issueDescription,
      issueNotes: req.body.issueNotes,
      entryBy: req.body.entryBy,
    };
    const result = await serviceOrderService.createServiceOrder(input);
    res.status(201).json(result);
  },

  getServiceOrderById: async (req: Request, res: Response) => {
    const result = await serviceOrderService.getServiceOrderByID(req.params.serviceOrderId);
    res.status(200).json(result);
  },

  updateServiceOrder: async (req: Request, res: Response) => {
    const input: ServiceOrder.PatchServiceOrder = {
      userProductId: req.body.userProductId,
      estimatedPrice: req.body.estimatedPrice,
      finalPrice: req.body.finalPrice,
      paymentMethod: req.body.paymentMethod,
      paymentStatus: req.body.paymentStatus,
      priorityLevel: req.body.priorityLevel,
      estimatedCompletionDate: req.body.estimatedCompletionDate,
      actualCompletionDate: req.body.actualCompletionDate,
      issueDescription: req.body.issueDescription,
      issueNotes: req.body.issueNotes,
    };
    const result = await serviceOrderService.updateServiceOrder(req.params.serviceOrderId, input);
    res.status(200).json(result);
  },

  deleteServiceOrder: async (req: Request, res: Response) => {
    await serviceOrderService.deleteServiceOrder(req.params.serviceOrderId);
    res.status(204).send();
  },
};

export default ServiceOrderController;
