import { Request, Response } from 'express';
import { userService } from '../services/user.service';
import * as UserModel from '../models/user.model';

const UserController =  {
    getUsers: async(req: Request,res: Response) => {
        const input: UserModel.UserQueryParams = {
            userName: req.query.userName as string | undefined,
            email: req.query.email as string | undefined,
            roleId: req.query.roleId ? parseInt(req.query.roleId as string) : undefined,
            page: req.query.page ? parseInt(req.query.page as string) : undefined,
            limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
            offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
        }   
        const result = await userService.getUsers(input);
        return res.status(200).json(result);
    },
    createUser: async(req: Request,res: Response) => {
          const input: UserModel.CreateUser = {
            userName: req.body.userName as string,
            email: req.body.email as string,
            roleId: req.body.roleId as number
        };
        const result: UserModel.User = await userService.createUser(input);
        res.status(201).json(result);
    },
    getUserById: async(req: Request,res: Response) => {
        const userId: string = req.params.userId[0];
        const result: UserModel.User = await userService.getUserByID(userId);
        res.status(200).json(result);
    },
    updateUser: async(req: Request,res: Response) => {
        const input: UserModel.PatchUser = {
            userName: req.body.userName as string | undefined,
            email: req.body.email as string | undefined,
            roleId: req.body.roleId as number | undefined
        };
        const userId: string = req.params.userId[0];
        const result = await userService.updateUser(userId, input);
        res.status(200).json(result);
    },
    deleteUser: async(req: Request,res: Response) => {
        const userId: string = req.params.userId[0];
        const result = await userService.deleteUser(userId);
        res.status(200).json(result);
    },
}

export default UserController;