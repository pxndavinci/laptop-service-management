import express, { Router } from 'express';  
const router: Router = express.Router();  

/* GET service orders listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a service order resource');
}); 

export default router;