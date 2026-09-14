import db from '../db/index';

export const authRepo = {
  async getAccountByUsername(username: string) {
    return db
      .selectFrom('staff_account as sa')
      .innerJoin('user_data as u', 'u.userId', 'sa.userId')
      .select(['sa.userId', 'sa.username', 'sa.passwordHash', 'sa.passwordChangedAt', 'u.userName'])
      .where('sa.username', '=', username)
      .executeTakeFirst();
  },

  async getAccountByUserId(userId: string) {
    return db
      .selectFrom('staff_account as sa')
      .innerJoin('user_data as u', 'u.userId', 'sa.userId')
      .select(['sa.userId', 'sa.username', 'sa.passwordChangedAt', 'u.userName'])
      .where('sa.userId', '=', userId)
      .executeTakeFirst();
  },
};

export default authRepo;
