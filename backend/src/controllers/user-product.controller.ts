import { Request, Response } from 'express';
import { userProductService } from '../services/user-product.service';
import * as UserProduct from '../models/user-product.model';

const UserProductController = {
  getUserProducts: async (req: Request, res: Response) => {
    const input: UserProduct.UserProductQueryParams = {
      userId: req.query.userId as string | undefined,
      productId: req.query.productId as string | undefined,
      serialNumber: req.query.serialNumber as string | undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    };
    const result = await userProductService.getUserProducts(input);
    res.status(200).json(result);
  },

  createUserProduct: async (req: Request, res: Response) => {
    const input: UserProduct.CreateUserProduct = {
      userId: req.body.userId,
      productId: req.body.productId,
      serialNumber: req.body.serialNumber,
      loginPassword: req.body.loginPassword,
      additionalInfo: req.body.additionalInfo,
    };
    const result = await userProductService.createUserProduct(input);
    res.status(201).json(result);
  },

  getUserProductById: async (req: Request, res: Response) => {
    const result = await userProductService.getUserProductByID(req.params.userProductId);
    res.status(200).json(result);
  },

  updateUserProduct: async (req: Request, res: Response) => {
    const input: UserProduct.PatchUserProduct = {
      userId: req.body.userId,
      productId: req.body.productId,
      serialNumber: req.body.serialNumber,
      loginPassword: req.body.loginPassword,
      additionalInfo: req.body.additionalInfo,
    };
    const result = await userProductService.updateUserProduct(req.params.userProductId, input);
    res.status(200).json(result);
  },

  deleteUserProduct: async (req: Request, res: Response) => {
    await userProductService.deleteUserProduct(req.params.userProductId);
    res.status(204).send();
  },
};

export default UserProductController;
