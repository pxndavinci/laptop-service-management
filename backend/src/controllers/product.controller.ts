import { Request, Response } from 'express';
import { productService } from '../services/product.service';
import * as Product from '../models/product.model';

const ProductController = {
  getProducts: async (req: Request, res: Response) => {
    const input: Product.ProductQueryParams = {
      productName: req.query.productName as string | undefined,
      brandId: req.query.brandId as string | undefined,
      productTypeId: req.query.productTypeId as string | undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    };
    const result = await productService.getProducts(input);
    res.status(200).json(result);
  },

  createProduct: async (req: Request, res: Response) => {
    const input: Product.CreateProduct = {
      productName: req.body.productName,
      description: req.body.description,
      brandId: req.body.brandId,
      productTypeId: req.body.productTypeId,
    };
    const result = await productService.createProduct(input);
    res.status(201).json(result);
  },

  getProductById: async (req: Request, res: Response) => {
    const result = await productService.getProductByID(req.params.productId);
    res.status(200).json(result);
  },

  updateProduct: async (req: Request, res: Response) => {
    const input: Product.PatchProduct = {
      productName: req.body.productName,
      description: req.body.description,
      brandId: req.body.brandId,
      productTypeId: req.body.productTypeId,
    };
    const result = await productService.updateProduct(req.params.productId, input);
    res.status(200).json(result);
  },

  deleteProduct: async (req: Request, res: Response) => {
    await productService.deleteProduct(req.params.productId);
    res.status(204).send();
  },
};

export default ProductController;
