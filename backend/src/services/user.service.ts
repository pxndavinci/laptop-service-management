import {userRepo} from '../repo/user.repo';
import * as UserDTO from '../dtos/user.dto';

export const userService = {
    async getUsers(params: UserDTO.UserQueryParams) {
        const page: number = params.page && params.page > 0 ? params.page : 1;
        const limit: number = params.limit && params.limit > 0 ? params.limit : 10;
        const offset: number = (page - 1) * limit;

        const [users, total] = await Promise.all([
            userRepo.getUsers({
                user_id: params.user_id,
                search: params.search,
                role_id: params.role_id,
                limit,
                offset
            }),
            userRepo.countUsers({
                search: params.search,
                role_id: params.role_id
            })
        ]);
        return {
            users: users.rows,
            total: parseInt(total.rows[0].count, 10),
            page,
            limit
        };
    },
    async createUser(data: UserDTO.CreateUser) {
        return (await userRepo.createUser(data)).rows[0];
    },
    async updateUser(user_id: string, data: UserDTO.UpdateUser) {
        const result = await userRepo.updateUser(user_id, data)
        if (result === null) {
            return "No updates performed or user not found";
        }
        return result.rows[0];
    },
    async deleteUser(user_id: string) {
        return await userRepo.deleteUser(user_id);
    }
}