/**
 * Production entrypoint: bring the database schema and reference data up to
 * date, then start the API. A failed migration stops the container, so the
 * deploy healthcheck fails and the release watcher rolls back.
 */
import { migrate } from './migrate';
import { seed } from './seed';

async function start() {
  await migrate();
  await seed({ strict: false });
  await import('../src/server');
}

start().catch((error) => {
  console.error(`Startup failed: ${error instanceof Error ? error.message : error}`);
  process.exit(1);
});
