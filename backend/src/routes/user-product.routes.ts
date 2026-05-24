import express, { Router } from 'express';
import UserProductController from '../controllers/user-product.controller';

const router: Router = express.Router();

router.get('/', UserProductController.getUserProducts);
router.post('/', UserProductController.createUserProduct);
router.get('/:userProductId', UserProductController.getUserProductById);
router.patch('/:userProductId', UserProductController.updateUserProduct);
router.delete('/:userProductId', UserProductController.deleteUserProduct);

export default router;
