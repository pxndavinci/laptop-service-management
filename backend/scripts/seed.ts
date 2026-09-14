/**
 * Idempotent seed: inserts the reference data the app needs to work.
 * Safe to run any number of times; existing rows are left untouched.
 *
 *   npm run seed
 */
import db from '../src/db/index';
import { CANONICAL_STATUSES } from '../src/lib/statuses';
import { ROLE } from '../src/lib/roles';

const STAFF_NAME = process.env.STAFF_NAME || 'Shop Operator';

async function seedRoles() {
  const result = await db
    .insertInto('role')
    .values([
      { roleId: ROLE.CUSTOMER, roleName: 'customer', isCustomer: true },
      { roleId: ROLE.STAFF, roleName: 'admin', isServicer: true },
    ])
    .onConflict((oc) => oc.doNothing())
    .executeTakeFirst();
  console.log(`roles:    ${result.numInsertedOrUpdatedRows ?? 0n} inserted`);
}

async function seedStatuses() {
  const result = await db
    .insertInto('status')
    .values(CANONICAL_STATUSES.map((statusName) => ({ statusName })))
    .onConflict((oc) => oc.column('statusName').doNothing())
    .executeTakeFirst();
  console.log(`statuses: ${result.numInsertedOrUpdatedRows ?? 0n} inserted`);
}

async function seedStaffUser() {
  const existing = await db
    .selectFrom('user_data')
    .select(['userId', 'userName'])
    .where('roleId', '=', ROLE.STAFF)
    .orderBy('createdAt', 'asc')
    .executeTakeFirst();

  const staff =
    existing ??
    (await db
      .insertInto('user_data')
      .values({ userName: STAFF_NAME, roleId: ROLE.STAFF })
      .returning(['userId', 'userName'])
      .executeTakeFirstOrThrow());

  console.log(`staff:    ${existing ? 'exists' : 'created'} — ${staff.userName} (${staff.userId})`);
}

async function main() {
  await seedRoles();
  await seedStatuses();
  await seedStaffUser();
}

main()
  .then(() => db.destroy())
  .catch(async (error) => {
    console.error('Seed failed:', error);
    await db.destroy();
    process.exit(1);
  });
