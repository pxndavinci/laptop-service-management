import { Request, Response } from 'express';
import { userService } from '../services/user.service';
import * as User from '../models/user.model';

const UserController = {
  getUsers: async (req: Request, res: Response) => {
    const input: User.UserQueryParams = {
      userName: req.query.userName as string | undefined,
      email: req.query.email as string | undefined,
      roleId: req.query.roleId ? Number(req.query.roleId) : undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    };
    const result = await userService.getUsers(input);
    res.status(200).json(result);
  },

  createUser: async (req: Request, res: Response) => {
    const input: User.CreateUser = {
      userName: req.body.userName,
      email: req.body.email,
      address: req.body.address,
      roleId: req.body.roleId,
    };
    const result = await userService.createUser(input);
    res.status(201).json(result);
  },

  getUserById: async (req: Request, res: Response) => {
    const result = await userService.getUserByID(req.params.userId);
    res.status(200).json(result);
  },

  updateUser: async (req: Request, res: Response) => {
    const input: User.PatchUser = {
      userName: req.body.userName,
      email: req.body.email,
      address: req.body.address,
      roleId: req.body.roleId,
    };
    const result = await userService.updateUser(req.params.userId, input);
    res.status(200).json(result);
  },

  deleteUser: async (req: Request, res: Response) => {
    await userService.deleteUser(req.params.userId);
    res.status(204).send();
  },
};

export default UserController;
