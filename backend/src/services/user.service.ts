import {userRepo} from '../repos/user.repo';
import * as User from '../models/user.model';

export const userService = {
    async getUsers(params: User.UserQueryParams) {
        params.page = params.page && params.page > 0 ? params.page : 1,
        params.limit = params.limit && params.limit > 0 ? params.limit : 10,
        params.offset = (params.page - 1) * params.limit;
        const [users, total]= await userRepo.getUsers(params);
        return {
            users: users,
            total: total,
            page: params.page,
            limit: params.limit
        };
    },
    async getUserByID(userId: string) {
        return await userRepo.getUserByID(userId);
    },
    async createUser(data: User.CreateUser) {
        return await userRepo.createUser(data);
    },
    async updateUser(userId: string, data: User.PatchUser) {
        const result = await userRepo.updateUser(userId, data)
        if (result === null) {
            return "No updates performed or user not found";
        }
        return result;
    },
    async deleteUser(userId: string) {
        return await userRepo.deleteUser(userId);
    }
}