import express, { Router } from 'express';
import ReferenceController from '../controllers/reference.controller';

const router: Router = express.Router();

// Roles
router.get('/roles', ReferenceController.getRoles);
router.post('/roles', ReferenceController.createRole);
router.patch('/roles/:roleId', ReferenceController.updateRole);
router.delete('/roles/:roleId', ReferenceController.deleteRole);

// Brands
router.get('/brands', ReferenceController.getBrands);
router.post('/brands', ReferenceController.createBrand);
router.patch('/brands/:brandId', ReferenceController.updateBrand);
router.delete('/brands/:brandId', ReferenceController.deleteBrand);

// Product types
router.get('/product-types', ReferenceController.getProductTypes);
router.post('/product-types', ReferenceController.createProductType);
router.patch('/product-types/:productTypeId', ReferenceController.updateProductType);
router.delete('/product-types/:productTypeId', ReferenceController.deleteProductType);

// Statuses
router.get('/statuses', ReferenceController.getStatuses);
router.post('/statuses', ReferenceController.createStatus);
router.patch('/statuses/:statusId', ReferenceController.updateStatus);
router.delete('/statuses/:statusId', ReferenceController.deleteStatus);

export default router;
