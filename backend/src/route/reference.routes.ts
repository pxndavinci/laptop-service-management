import 'express-async-errors';
import express, { Router } from 'express';
import { referenceService } from '../service/reference.service';

const router: Router = express.Router();

/* GET references listing. */
router.get('/', async (req, res, next) => {
  res.send('respond with a reference resource');
});

// Roles endpoints
router.get('/roles', async (req, res, next) => {
  return res.json(await referenceService.getAllRole()); 
});

router.post('/roles', async (req, res, next) => {
  const {
    role_id,
    role_name,
    is_customer = false,
    is_business = false,
    is_servicer = false,
  } = req.body;
  const result = await referenceService.createRole({role_id, role_name, is_customer, is_business, is_servicer});
  return res.status(201).json(result);
});

// Brands endpoints
router.get('/brands', async (req, res, next) => {
  return res.json(await referenceService.getAllBrand()); 
});

router.post('/brands', async (req, res, next) => {
  const {
    brand_name
  } = req.body;
  const result = await referenceService.createBrand({brand_name});
  return res.status(201).json(result);
});

// Product Type endpoints
router.get('/producttypes', async (req, res, next) => {
  return res.json(await referenceService.getAllProductType()); 
});

router.post('/producttypes', async (req, res, next) => {
  const {
    product_type_name
  } = req.body;
  const result = await referenceService.createProductType({product_type_name});
  return res.status(201).json(result);
});

//

export default router;