import express, { Router } from 'express';
import { userService } from '../services/user.service';


const router: Router = express.Router();

/* GET users listing. */
router.get('/', async (req, res, next) => {    
  const {
    search,
    role_id,
    page = '1',
    limit = '10'
  } = req.query;

  const result = await userService.getUsers({
    search: search as string | undefined,
    role_id: role_id ? Number(role_id) : undefined,
    page: Number(page),
    limit: Number(limit)
  });
  res.json(result);
});

router.post('/', async function(req, res, next) {
  const {
    user_name,
    email,
    role_id
  } = req.body;

  const result = await userService.createUser({
    user_name,
    email,
    role_id
  });
  res.status(201).json(result);
});

router.get('/:user_id', function(req, res, next) {
  const userId = req.params.user_id;
  // Logic to get user by ID
  res.send(`User details for ID: ${userId}`);
});

router.put('/:user_id', function(req, res, next) {
  const userId = req.params.user_id;
  // Logic to update user by ID
  res.send(`User with ID: ${userId} updated`);
});

router.delete('/:user_id', function(req, res, next) {
  const userId = req.params.user_id;
  // Logic to delete user by ID
  res.send(`User with ID: ${userId} deleted`);
});

router.get('/:user_id/contacts', function(req, res, next) {
    const userId = req.params.user_id;
    // Logic to get contacts for a specific user
    res.send(`Contacts for User ID: ${userId}`);
});

router.post('/:user_id/contacts', function(req, res, next) {
    const userId = req.params.user_id;
    // Logic to create a new contact for a specific user
    res.status(201).send(`Contact created for User ID: ${userId}`);
});

export default router;
