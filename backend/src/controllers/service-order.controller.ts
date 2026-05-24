import { Request, Response } from 'express';
import serviceOrderService from '../services/service-order.service';
import * as ServiceOrderModel from '../models/service-order.model';

const ServiceOrderController = {
  getServiceOrders: async (req: Request, res: Response) => {
    const input = {
      tagNo: req.query.tagNo ? parseInt(req.query.tagNo as string) : undefined,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
    };
    const result = await serviceOrderService.getServiceOrders(input);
    res.status(200).json(result);
  },

  createServiceOrder: async (req: Request, res: Response) => {
    const input: ServiceOrderModel.CreateServiceOrder = {
      userProductId: req.body.userProductId as string,
      estimatedPrice: req.body.estimatedPrice as number | undefined,
      paymentMethod: req.body.paymentMethod as ServiceOrderModel.PaymentMethod | undefined,
      paymentStatus: req.body.paymentStatus as ServiceOrderModel.PaymentStatus | undefined,
      priorityLevel: req.body.priorityLevel as number,
      estimatedCompletionDate: req.body.estimatedCompletionDate as string | undefined,
      issueDescription: req.body.issueDescription as ServiceOrderModel.IssueDescription,
      issueNotes: req.body.issueNotes as string | undefined,
      entryByUserId: req.body.entryByUserId as string,
    };
    const result = await serviceOrderService.createServiceOrder(input);
    res.status(201).json(result);
  },

  getServiceOrderById: async (req: Request, res: Response) => {
    const id: string = req.params.serviceOrderId[0];
    const result = await serviceOrderService.getServiceOrderByID(id);
    res.status(200).json(result);
  },

  updateServiceOrder: async (req: Request, res: Response) => {
    const input: ServiceOrderModel.PatchServiceOrder = {
      userProductId: req.body.userProductId as string | undefined,
      estimatedPrice: req.body.estimatedPrice as number | undefined,
      finalPrice: req.body.finalPrice as number | undefined,
      paymentMethod: req.body.paymentMethod as ServiceOrderModel.PaymentMethod | undefined,
      paymentStatus: req.body.paymentStatus as ServiceOrderModel.PaymentStatus | undefined,
      priorityLevel: req.body.priorityLevel as number | undefined,
      estimatedCompletionDate: req.body.estimatedCompletionDate as string | undefined,
      actualCompletionDate: req.body.actualCompletionDate as string | undefined,
      issueDescription: req.body.issueDescription as ServiceOrderModel.IssueDescription | undefined,
      issueNotes: req.body.issueNotes as string | undefined,
    };
    const id: string = req.params.serviceOrderId[0];
    const result = await serviceOrderService.updateServiceOrder(id, input);
    res.status(200).json(result);
  },

  deleteServiceOrder: async (req: Request, res: Response) => {
    const id: string = req.params.serviceOrderId[0];
    const result = await serviceOrderService.deleteServiceOrder(id);
    res.status(200).json(result);
  },
};

export default ServiceOrderController;
