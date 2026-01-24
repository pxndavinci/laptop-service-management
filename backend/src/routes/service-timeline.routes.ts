import express, { Router } from 'express';

const router: Router = express.Router();    

/* GET service timelines listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a service timeline resource');
});

export default router;