/**
 * Idempotent seed: inserts the reference data the app needs to work.
 * Safe to run any number of times; existing rows are left untouched.
 *
 *   npm run seed           (also runs, non-strict, every time the container starts)
 *
 * The staff login is created from STAFF_USERNAME / STAFF_PASSWORD on the first
 * run only. To change the password later use `npm run staff:password`.
 */
import db from '../src/db/index';
import { CANONICAL_STATUSES } from '../src/lib/statuses';
import { ROLE } from '../src/lib/roles';
import { hashPassword, passwordProblem } from '../src/lib/password';

type Log = (line: string) => void;

const STAFF_NAME = process.env.STAFF_NAME || 'Shop Operator';
const STAFF_USERNAME = process.env.STAFF_USERNAME?.trim();
const STAFF_PASSWORD = process.env.STAFF_PASSWORD;

async function seedRoles(log: Log) {
  const result = await db
    .insertInto('role')
    .values([
      { roleId: ROLE.CUSTOMER, roleName: 'customer', isCustomer: true },
      { roleId: ROLE.STAFF, roleName: 'admin', isServicer: true },
    ])
    .onConflict((oc) => oc.doNothing())
    .executeTakeFirst();
  log(`roles:    ${result.numInsertedOrUpdatedRows ?? 0n} inserted`);
}

async function seedStatuses(log: Log) {
  const result = await db
    .insertInto('status')
    .values(CANONICAL_STATUSES.map((statusName) => ({ statusName })))
    .onConflict((oc) => oc.column('statusName').doNothing())
    .executeTakeFirst();
  log(`statuses: ${result.numInsertedOrUpdatedRows ?? 0n} inserted`);
}

/**
 * `strict` (CLI): fail when the staff login is missing and cannot be created.
 * Non-strict (container start): warn instead, so the app still starts.
 */
async function seedStaff(strict: boolean, log: Log) {
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
  log(`staff:    ${existing ? 'exists' : 'created'} — ${staff.userName} (${staff.userId})`);

  const account = await db
    .selectFrom('staff_account')
    .select('username')
    .where('userId', '=', staff.userId)
    .executeTakeFirst();
  if (account) {
    log(`login:    exists — username "${account.username}"`);
    return;
  }

  const problem = !STAFF_USERNAME ? 'STAFF_USERNAME is empty' : passwordProblem(STAFF_PASSWORD);
  if (problem) {
    const message =
      `Cannot create the staff login: ${problem}. ` +
      'Set STAFF_USERNAME and STAFF_PASSWORD and run the seed again.';
    if (strict) throw new Error(message);
    log(`WARNING: ${message} Nobody can log in until then.`);
    return;
  }

  await db
    .insertInto('staff_account')
    .values({
      userId: staff.userId,
      username: STAFF_USERNAME!,
      passwordHash: await hashPassword(STAFF_PASSWORD!),
    })
    .execute();
  log(`login:    created — username "${STAFF_USERNAME}"`);
}

export async function seed({
  strict = true,
  log = console.log,
}: { strict?: boolean; log?: Log } = {}) {
  await seedRoles(log);
  await seedStatuses(log);
  await seedStaff(strict, log);
}

if (require.main === module) {
  seed()
    .then(() => db.destroy())
    .catch(async (error) => {
      console.error(`Seed failed: ${error instanceof Error ? error.message : error}`);
      await db.destroy();
      process.exit(1);
    });
}
