/**
 * Changes the staff password (or creates the login if it is missing).
 * Existing sessions are signed out, because tokens issued before the change
 * are rejected.
 *
 *   STAFF_USERNAME=uncle STAFF_PASSWORD='new long password' npm run staff:password
 */
import { sql } from 'kysely';
import db from '../src/db/index';
import { ROLE } from '../src/lib/roles';
import { hashPassword, passwordProblem } from '../src/lib/password';

async function main() {
  const username = process.env.STAFF_USERNAME?.trim();
  const password = process.env.STAFF_PASSWORD;
  const problem = !username ? 'STAFF_USERNAME is empty' : passwordProblem(password);
  if (problem) throw new Error(problem);

  const passwordHash = await hashPassword(password!);

  const updated = await db
    .updateTable('staff_account')
    .set({ passwordHash, passwordChangedAt: sql<Date>`now()` as unknown as Date })
    .where('username', '=', username!)
    .executeTakeFirst();
  if (updated.numUpdatedRows > 0n) {
    console.log(`Password changed for "${username}". Existing sessions are signed out.`);
    return;
  }

  const staff = await db
    .selectFrom('user_data')
    .select('userId')
    .where('roleId', '=', ROLE.STAFF)
    .orderBy('createdAt', 'asc')
    .executeTakeFirst();
  if (!staff) throw new Error('No staff user exists yet — run `npm run seed` first.');

  const hasAccount = await db
    .selectFrom('staff_account')
    .select('username')
    .where('userId', '=', staff.userId)
    .executeTakeFirst();
  if (hasAccount) {
    throw new Error(`No login named "${username}". The staff login is "${hasAccount.username}".`);
  }

  await db
    .insertInto('staff_account')
    .values({ userId: staff.userId, username: username!, passwordHash })
    .execute();
  console.log(`Login "${username}" created.`);
}

main()
  .then(() => db.destroy())
  .catch(async (error) => {
    console.error(`Failed: ${error instanceof Error ? error.message : error}`);
    await db.destroy();
    process.exit(1);
  });
