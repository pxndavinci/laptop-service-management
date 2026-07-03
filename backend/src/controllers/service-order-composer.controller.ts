import { Request, Response } from 'express';
import { serviceOrderComposerService } from '../services/service-order-composer.service';
import {
  ServiceOrderComposerSearchParams,
  ComposeServiceOrderRequest,
} from '../models/service-order-composer.model';

const ServiceOrderComposerController = {
  getSearchResults: async (req: Request, res: Response) => {
    const input: ServiceOrderComposerSearchParams = {
      userName: req.query.userName as string | undefined,
      contactNumber: req.query.contactNumber as string | undefined,
      email: req.query.email as string | undefined,
      productName: req.query.productName as string | undefined,
      brandName: req.query.brandName as string | undefined,
      productTypeName: req.query.productTypeName as string | undefined,
      serialNumber: req.query.serialNumber as string | undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
    };
    const result = await serviceOrderComposerService.getSearchResults(input);
    res.status(200).json(result);
  },

  composeServiceOrder: async (req: Request, res: Response) => {
    const input = req.body as ComposeServiceOrderRequest;
    const result = await serviceOrderComposerService.composeServiceOrder(input);
    res.status(201).json(result);
  },
};

export default ServiceOrderComposerController;
