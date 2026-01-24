import {userRepo} from '../repo/user.repo';
import * as UserDTO from '../dto/user.dto';

export const userService = {
    async getUsers(params: UserDTO.UserQueryParams) {
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
    async createUser(data: UserDTO.CreateUser) {
        return await userRepo.createUser(data);
    },
    async updateUser(user_id: string, data: UserDTO.UpdateOrDeleteUser) {
        const result = await userRepo.updateUser(user_id, data)
        if (result === null) {
            return "No updates performed or user not found";
        }
        return result;
    },
    async deleteUser(user_id: string, data: UserDTO.UpdateOrDeleteUser) {
        return await userRepo.deleteUser(user_id, data);
    }
}