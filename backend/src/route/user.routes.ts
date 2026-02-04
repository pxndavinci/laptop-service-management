import express, { Router } from 'express';
import { userService } from '../service/user.service';
import * as UserDTO from '../dto/user.dto';

const router: Router = express.Router();

router.get('/', async (req, res, next)  => {    
  const input: UserDTO.UserQueryParams = {
    user_name: req.query.user_name as string | undefined,
    email: req.query.email as string | undefined,
    role_id: req.query.role_id ? parseInt(req.query.role_id as string) : undefined,
    page: req.query.page ? parseInt(req.query.page as string) : undefined,
    limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
    offset: undefined,
  }
  const result = await userService.getUsers(input);
  res.json(result);
});

router.post('/', async (req, res, next) => {
  const input: UserDTO.CreateUser = {
    user_name: req.body.user_name as string,
    email: req.body.email as string,
    address: req.body.address as string,
    role_id: req.body.role_id as number
  };
  const result = await userService.createUser(input);
  res.status(201).json(result);
});

router.get('/:user_id', async(req, res, next) => {
  const user_id: string = req.params.user_id;
  const result = await userService.getUserByID(user_id);
  res.status(200).json(result);
});

router.patch('/:user_id', async (req, res, next) => {
  const input: UserDTO.UpdateOrDeleteUser = {
    user_name: req.body.user_name as string | undefined,
    email: req.body.email as string | undefined,
    address: req.body.address as string | undefined,
    role_id: req.body.role_id as number | undefined
  };
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
