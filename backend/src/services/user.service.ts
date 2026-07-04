import { userRepo } from '../repos/user.repo';
import * as User from '../models/user.model';
import { NotFoundError } from '../middlewares/error.middleware';
import { paginate, requireAnyField } from '../lib/utils';

export const userService = {
  async getUsers(params: User.UserQueryParams) {
    const { page, limit, offset } = paginate(params.page, params.limit);
    const [data, total] = await userRepo.getUsers({ ...params, limit, offset });
    return { data, total, page, limit };
  },

  async getUserByID(userId: string) {
    const user = await userRepo.getUserByID(userId);
    if (!user) throw new NotFoundError('User not found');
    return user;
  },

  async createUser(data: User.CreateUser) {
    return userRepo.createUser(data);
  },

  async updateUser(userId: string, data: User.PatchUser) {
    requireAnyField(data);
    const user = await userRepo.updateUser(userId, data);
    if (!user) throw new NotFoundError('User not found');
    return user;
  },

  async deleteUser(userId: string) {
    const deleted = await userRepo.deleteUser(userId);
    if (!deleted) throw new NotFoundError('User not found');
  },
};
