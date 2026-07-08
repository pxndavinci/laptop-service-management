import 'dotenv/config';

/**
 * All environment access lives here. Validating at startup means a missing
 * .env fails immediately with instructions instead of a cryptic DB error.
 */
const REQUIRED = ['DB_USER', 'DB_PASSWORD', 'DB_HOST', 'DB_PORT', 'DB_NAME'] as const;

const missing = REQUIRED.filter((name) => !process.env[name]);
if (missing.length > 0) {
  console.error(
    [
      `Missing required environment variables: ${missing.join(', ')}`,
      '',
      'Create backend/.env by copying the example file, then adjust the values:',
      '',
      '    cp .env.example .env',
      '',
      'The defaults in .env.example match the docker-compose Postgres.',
    ].join('\n')
  );
  process.exit(1);
}

export const env = {
  port: parseInt(process.env.PORT || '3000', 10),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  db: {
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    host: process.env.DB_HOST!,
    port: parseInt(process.env.DB_PORT!, 10),
    database: process.env.DB_NAME!,
  },
};
