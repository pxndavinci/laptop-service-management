import express, { Router } from 'express';
import { userService } from '../services/user.service';
import * as UserDTO from '../dtos/user.dto';

const router: Router = express.Router();

router.get('/', async (req, res, next)  => {    
  const input: UserDTO.UserQueryParams = req.query;
  const result = await userService.getUsers(input);
  res.json(result);
});

router.post('/', async (req, res, next) => {
  const input: UserDTO.CreateUser = req.body;
  const result = await userService.createUser(input);
  res.status(201).json(result);
});

router.patch('/:user_id', async (req, res, next) => {
  const input: UserDTO.UpdateOrDeleteUser = req.body;
  const user_id: string = req.params.user_id;
  const result = await userService.updateUser(user_id, input);
  res.status(200).json(result);
});

router.delete('/:user_id', async (req, res, next) => {
  const userId: string = req.params.user_id;
  const result = await userService.deleteUser(userId);
  res.status(200).json(result);
});

export default router;
