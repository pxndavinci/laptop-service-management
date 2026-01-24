import 'express-async-errors';
import express, { Router } from 'express';
import { referenceService } from '../service/reference.service';

const router: Router = express.Router();

/* GET references listing. */
router.get('/', async (req, res, next) => {
  res.send('respond with a reference resource');
});

router.get('/roles', async (req, res, next) => {
  return res.json(await referenceService.getallRole()); 
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

export default router;