import 'dotenv/config';

/**
 * All environment access lives here. Validating at startup means a missing
 * .env fails immediately with instructions instead of a cryptic DB error.
 */
const REQUIRED = ['DB_USER', 'DB_PASSWORD', 'DB_HOST', 'DB_PORT', 'DB_NAME', 'JWT_SECRET'] as const;

const fail = (lines: string[]): never => {
  console.error(lines.join('\n'));
  process.exit(1);
};

const missing = REQUIRED.filter((name) => !process.env[name]);
if (missing.length > 0) {
  fail([
    `Missing required environment variables: ${missing.join(', ')}`,
    '',
    'Create backend/.env by copying the example file, then adjust the values:',
    '',
    '    cp .env.example .env',
    '',
    'The defaults in .env.example match the docker-compose Postgres.',
  ]);
}

// A short or placeholder secret would let anyone forge a session token.
const JWT_SECRET = process.env.JWT_SECRET!;
if (JWT_SECRET.length < 32 || /change-me/i.test(JWT_SECRET)) {
  fail([
    'JWT_SECRET must be a random string of at least 32 characters.',
    'Generate one with:',
    '',
    '    openssl rand -base64 48',
  ]);
}

const bool = (value: string | undefined, fallback: boolean) =>
  value === undefined || value === ''
    ? fallback
    : ['1', 'true', 'yes'].includes(value.toLowerCase());

export const env = {
  port: parseInt(process.env.PORT || '3000', 10),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  /** Set when running behind a reverse proxy so client IPs (rate limiting) are real. */
  trustProxy: bool(process.env.TRUST_PROXY, false),
  /** Timezone used for "today / this week" dashboard boundaries. */
  appTimezone: process.env.APP_TIMEZONE || 'Asia/Kolkata',
  auth: {
    jwtSecret: JWT_SECRET,
    sessionTtlHours: parseInt(process.env.SESSION_TTL_HOURS || '12', 10),
    /** Must be true when the app is served over HTTPS; browsers drop Secure cookies on plain HTTP. */
    cookieSecure: bool(process.env.COOKIE_SECURE, false),
  },
  db: {
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    host: process.env.DB_HOST!,
    port: parseInt(process.env.DB_PORT!, 10),
    database: process.env.DB_NAME!,
  },
};
