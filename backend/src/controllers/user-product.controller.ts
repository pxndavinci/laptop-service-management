import { Request, Response } from 'express';
import { userProductService } from '../services/user-product.service';
import * as UserProductModel from '../models/user-product.model';

const UserProductController = {
  getUserProducts: async (req: Request, res: Response) => {
    const input: UserProductModel.UserProductQueryParams = {
      userId: req.query.userId as string | undefined,
      productId: req.query.productId as string | undefined,
      serialNumber: req.query.serialNumber as string | undefined,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
    };

    const result = await userProductService.getUserProducts(input);
    return res.status(200).json(result);
  },

  createUserProduct: async (req: Request, res: Response) => {
    const input: UserProductModel.CreateUserProduct = {
      userId: req.body.userId as string,
      productId: req.body.productId as string,
      serialNumber: req.body.serialNumber as string,
      loginPassword: req.body.loginPassword as string | undefined,
      additionalInfo: req.body.additionalInfo as string | undefined,
    };

    const result = await userProductService.createUserProduct(input);
    res.status(201).json(result);
  },

  getUserProductById: async (req: Request, res: Response) => {
    const userProductId: string = req.params.userProductId[0];
    const result = await userProductService.getUserProductByID(userProductId);
    res.status(200).json(result);
  },

  updateUserProduct: async (req: Request, res: Response) => {
    const input: UserProductModel.PatchUserProduct = {
      userId: req.body.userId as string | undefined,
      productId: req.body.productId as string | undefined,
      serialNumber: req.body.serialNumber as string | undefined,
      loginPassword: req.body.loginPassword as string | undefined,
      additionalInfo: req.body.additionalInfo as string | undefined,
    };
    const userProductId: string = req.params.userProductId[0];
    const result = await userProductService.updateUserProduct(userProductId, input);
    res.status(200).json(result);
  },

  deleteUserProduct: async (req: Request, res: Response) => {
    const userProductId: string = req.params.userProductId[0];
    const result = await userProductService.deleteUserProduct(userProductId);
    res.status(200).json(result);
  },
};

export default UserProductController;
