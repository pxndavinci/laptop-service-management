import express, { Router } from 'express';
import ProductController from '../controllers/product.controller';

const router: Router = express.Router();

router.get('/', ProductController.getProducts);
router.post('/', ProductController.createProduct);
router.get('/:product_id', ProductController.getProductById);
router.patch('/:product_id', ProductController.updateProduct);
router.delete('/:product_id', ProductController.deleteProduct);

export default router;
