import express, { Router } from 'express';

const router: Router = express.Router();

/* GET products listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/', function(req, res, next) {
  // Logic to create a new product
  res.status(201).send('Product created');
});

router.get('/:product_id', function(req, res, next) {
  const productId = req.params.product_id;
  // Logic to get product by ID
  res.send(`Product details for ID: ${productId}`);
});

router.put('/:product_id', function(req, res, next) {
  const productId = req.params.product_id;
  // Logic to update product by ID
  res.send(`Product with ID: ${productId} updated`);
});

router.delete('/:product_id', function(req, res, next) {
  const productId = req.params.product_id;
  // Logic to delete product by ID
  res.send(`Product with ID: ${productId} deleted`);
});

export default router;