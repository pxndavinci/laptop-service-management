import db from '../db/index';
import * as User from '../models/user.model';

export const userRepo = {
  async getUsers(
    params: User.UserQueryParams & { limit: number; offset: number }
  ): Promise<[User.User[], number]> {
    const filtered = db
      .selectFrom('user_data')
      .$if(!!params.userName, (qb) => qb.where('userName', 'ilike', `%${params.userName}%`))
      .$if(!!params.email, (qb) => qb.where('email', 'ilike', `%${params.email}%`))
      .$if(params.roleId !== undefined, (qb) => qb.where('roleId', '=', params.roleId!));

    const users = await filtered
      .selectAll()
      .orderBy('createdAt', 'desc')
      .limit(params.limit)
      .offset(params.offset)
      .execute();

    const { total } = await filtered
      .select((eb) => eb.fn.countAll<number>().as('total'))
      .executeTakeFirstOrThrow();

    return [users, total];
  },

  async getUserByID(userId: string): Promise<User.User | undefined> {
    return db.selectFrom('user_data').selectAll().where('userId', '=', userId).executeTakeFirst();
  },

  async createUser(data: User.CreateUser): Promise<User.User> {
    return db
      .insertInto('user_data')
      .values({
        userName: data.userName,
        roleId: data.roleId,
        email: data.email ?? null,
        address: data.address ?? null,
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  },

  async updateUser(userId: string, data: User.PatchUser): Promise<User.User | undefined> {
    return db
      .updateTable('user_data')
      .set({
        userName: data.userName,
        email: data.email,
        address: data.address,
        roleId: data.roleId,
      })
      .where('userId', '=', userId)
      .returningAll()
      .executeTakeFirst();
  },

  async deleteUser(userId: string): Promise<boolean> {
    const result = await db.deleteFrom('user_data').where('userId', '=', userId).executeTakeFirst();
    return result.numDeletedRows > 0n;
  },
};
