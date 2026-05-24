import { Request, Response } from 'express';
import { productService } from '../services/product.service';
import * as ProductModel from '../models/product.model';

const ProductController = {
  getProducts: async (req: Request, res: Response) => {
    const input: ProductModel.ProductQueryParams = {
      productName: req.query.productName as string | undefined,
      brandId: req.query.brandId as string | undefined,
      productTypeId: req.query.productTypeId as string | undefined,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
    };

    const result = await productService.getProducts(input);
    res.status(200).json(result);
  },

  createProduct: async (req: Request, res: Response) => {
    const input: ProductModel.CreateProduct = {
      productName: req.body.productName as string,
      description: req.body.description as string | undefined,
      brandId: req.body.brandId as string,
      productTypeId: req.body.productTypeId as string,
    };

    const result = await productService.createProduct(input);
    res.status(201).json(result);
  },

  getProductById: async (req: Request, res: Response) => {
    const productId: string = req.params.product_id[0];
    const result = await productService.getProductByID(productId);
    res.status(200).json(result);
  },

  updateProduct: async (req: Request, res: Response) => {
    const input: ProductModel.PatchProduct = {
      productName: req.body.productName as string | undefined,
      description: req.body.description as string | undefined,
      brandId: req.body.brandId as string | undefined,
      productTypeId: req.body.productTypeId as string | undefined,
    };
    const productId: string = req.params.product_id[0];
    const result = await productService.updateProduct(productId, input);
    res.status(200).json(result);
  },

  deleteProduct: async (req: Request, res: Response) => {
    const productId: string = req.params.product_id[0];
    const result = await productService.deleteProduct(productId);
    res.status(200).json(result);
  },
};

export default ProductController;
