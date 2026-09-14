import express, { Router } from 'express';
import ProductController from '../controllers/product.controller';

const router: Router = express.Router();

router.get('/', ProductController.getProducts);
router.post('/', ProductController.createProduct);
router.get('/:productId', ProductController.getProductById);
router.patch('/:productId', ProductController.updateProduct);
router.delete('/:productId', ProductController.deleteProduct);

export default router;
