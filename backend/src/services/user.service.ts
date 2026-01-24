import {userRepository} from '../repositories/user.repository';

interface UserQueryParams {
    search?: string;
    role_id?: number;
    page?: number;
    limit?: number;
}

export const userService = {
    async getUsers(params: UserQueryParams) {
        const page: number = params.page && params.page > 0 ? params.page : 1;
        const limit: number = params.limit && params.limit > 0 ? params.limit : 10;
        const offset: number = (page - 1) * limit;

        const [users, total] = await Promise.all([
            userRepository.getUsers({
                search: params.search,
                role_id: params.role_id,
                limit,
                offset
            }),
            userRepository.countUsers({
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
    async createUser(data: { user_name: string; email: string; role_id: number }) {
        return await userRepository.createUser(data);
    }
}