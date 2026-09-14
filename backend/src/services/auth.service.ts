import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import authRepo from '../repos/auth.repo';
import { env } from '../config/env';
import { AuthUser, LoginRequest } from '../models/auth.model';
import { AppError } from '../middlewares/error.middleware';
import { BCRYPT_ROUNDS } from '../lib/password';

export const SESSION_COOKIE = 'lsm_session';

// Compared against when the username does not exist, so a wrong username
// takes as long as a wrong password (no username probing by timing).
const DUMMY_HASH = bcrypt.hashSync('timing-equalizer-not-a-real-password', BCRYPT_ROUNDS);

interface SessionClaims {
  sub: string;
  iat: number;
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401);
  }
}

export const authService = {
  async login({ username, password }: LoginRequest): Promise<{ user: AuthUser; token: string }> {
    const account = await authRepo.getAccountByUsername(username.trim());
    const valid = await bcrypt.compare(password, account?.passwordHash ?? DUMMY_HASH);
    if (!account || !valid) throw new UnauthorizedError('Invalid username or password');

    const token = jwt.sign({}, env.auth.jwtSecret, {
      subject: account.userId,
      expiresIn: `${env.auth.sessionTtlHours}h`,
      algorithm: 'HS256',
    });
    return {
      user: { userId: account.userId, userName: account.userName, username: account.username },
      token,
    };
  },

  /**
   * Verifies the session token and re-checks the account on every request, so
   * deleting the account or changing the password revokes existing sessions.
   */
  async verifySession(token: string | undefined): Promise<AuthUser> {
    if (!token) throw new UnauthorizedError();

    let claims: SessionClaims;
    try {
      claims = jwt.verify(token, env.auth.jwtSecret, { algorithms: ['HS256'] }) as SessionClaims;
    } catch {
      throw new UnauthorizedError('Session expired or invalid');
    }

    const account = await authRepo.getAccountByUserId(claims.sub);
    if (!account) throw new UnauthorizedError('Session expired or invalid');

    // iat has 1-second resolution; allow tokens issued in the same second.
    const changedAt = Math.floor(account.passwordChangedAt.getTime() / 1000);
    if (claims.iat < changedAt) throw new UnauthorizedError('Session expired or invalid');

    return { userId: account.userId, userName: account.userName, username: account.username };
  },
};

export default authService;
