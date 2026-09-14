import { ExpressionBuilder } from 'kysely';
import db from '../db/index';
import { Database } from '../db/schema';
import * as User from '../models/user.model';

/** First contact number on file (oldest), as a correlated subquery. */
const firstContact = (eb: ExpressionBuilder<Database, 'user_data'>) =>
  eb
    .selectFrom('contact as c')
    .select('c.contactNumber')
    .whereRef('c.userId', '=', 'user_data.userId')
    .orderBy('c.createdAt', 'asc')
    .limit(1)
    .as('contactNumber');

export const userRepo = {
  async getUsers(
    params: User.UserQueryParams & { limit: number; offset: number }
  ): Promise<[User.UserWithContact[], number]> {
    const filtered = db
      .selectFrom('user_data')
      .$if(!!params.userName, (qb) => qb.where('userName', 'ilike', `%${params.userName}%`))
      .$if(!!params.email, (qb) => qb.where('email', 'ilike', `%${params.email}%`))
      .$if(params.roleId !== undefined, (qb) => qb.where('roleId', '=', params.roleId!));

    const users = await filtered
      .selectAll('user_data')
      .select(firstContact)
      .orderBy('createdAt', 'desc')
      .limit(params.limit)
      .offset(params.offset)
      .execute();

    const { total } = await filtered
      .select((eb) => eb.fn.countAll<number>().as('total'))
      .executeTakeFirstOrThrow();

    return [users, total];
  },

  async getUserByID(userId: string): Promise<User.UserWithContact | undefined> {
    return db
      .selectFrom('user_data')
      .selectAll('user_data')
      .select(firstContact)
      .where('userId', '=', userId)
      .executeTakeFirst();
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

  async hasStaffAccount(userId: string): Promise<boolean> {
    const row = await db
      .selectFrom('staff_account')
      .select('userId')
      .where('userId', '=', userId)
      .executeTakeFirst();
    return Boolean(row);
  },

  async deleteUser(userId: string): Promise<boolean> {
    const result = await db.deleteFrom('user_data').where('userId', '=', userId).executeTakeFirst();
    return result.numDeletedRows > 0n;
  },
};
