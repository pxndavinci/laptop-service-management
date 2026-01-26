import express, { Router } from 'express';
import { productService } from '../service/product.service';
import * as ProductDTO from '../dto/product.dto';

const router: Router = express.Router();

router.get('/', async (req, res, next)  => {    
  const input: ProductDTO.ProductQueryParams = {
    product_id: req.query.product_id as string | undefined,
    product_name: req.query.product_name as string | undefined,
    brand_id: req.query.brand_id as string | undefined,
    product_type_id: req.query.product_type_id  as string | undefined,
    page: req.query.page ? parseInt(req.query.page as string) : undefined,
    limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
    offset: undefined,
  }
  const result = await productService.getProducts(input);
  res.json(result);
});

router.post('/', async (req, res, next) => {
  const input: ProductDTO.CreateProduct = {
    product_name: req.query.product_name as string,
    brand_id: req.query.brand_id as string,
    product_type_id: req.query.product_type_id  as string
  };
  const result = await productService.createProduct(input);
  res.status(201).json(result);
});

router.patch('/:product_id', async (req, res, next) => {
  const input: ProductDTO.UpdateOrDeleteProduct = {
    product_name: req.query.product_name as string | undefined,
    brand_id: req.query.brand_id as string | undefined,
    product_type_id: req.query.product_type_id  as string | undefined
  };
  const product_id: string = req.params.product_id;
  const result = await productService.updateProduct(product_id, input);
  res.status(200).json(result);
});

router.delete('/:product_id', async (req, res, next) => {
  const productId: string = req.params.product_id;
  const result = await productService.deleteProduct(productId);
  res.status(200).json(result);
});

export default router;
