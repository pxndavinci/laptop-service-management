import { userRepo } from '../repos/user.repo';
import * as User from '../models/user.model';
import { ConflictError, NotFoundError } from '../middlewares/error.middleware';
import { paginate, requireAnyField } from '../lib/utils';
import { withUniqueMessages } from '../lib/db-errors';

const EMAIL_UNIQUE = { user_data_email_key: 'A customer with this email already exists' };

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
    return withUniqueMessages(EMAIL_UNIQUE, () => userRepo.createUser(data));
  },

  async updateUser(userId: string, data: User.PatchUser) {
    requireAnyField(data);
    const user = await withUniqueMessages(EMAIL_UNIQUE, () => userRepo.updateUser(userId, data));
    if (!user) throw new NotFoundError('User not found');
    return user;
  },

  /** Cascades (via foreign keys) to contacts, devices, orders and status history. */
  async deleteUser(userId: string) {
    if (await userRepo.hasStaffAccount(userId)) {
      throw new ConflictError('This user is the staff login and cannot be deleted');
    }
    const deleted = await userRepo.deleteUser(userId);
    if (!deleted) throw new NotFoundError('User not found');
  },
};
