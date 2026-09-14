import { CookieOptions, Request, Response } from 'express';
import authService, { SESSION_COOKIE } from '../services/auth.service';
import { currentUser } from '../middlewares/auth.middleware';
import { env } from '../config/env';

const cookieOptions = (): CookieOptions => ({
  httpOnly: true, // not readable from JavaScript, so XSS cannot steal the session
  sameSite: 'lax', // not sent on cross-site POST/DELETE, which blocks CSRF
  secure: env.auth.cookieSecure,
  path: '/',
});

const AuthController = {
  login: async (req: Request, res: Response) => {
    const { user, token } = await authService.login({
      username: req.body.username,
      password: req.body.password,
    });
    res.cookie(SESSION_COOKIE, token, {
      ...cookieOptions(),
      maxAge: env.auth.sessionTtlHours * 60 * 60 * 1000,
    });
    res.status(200).json(user);
  },

  logout: async (_req: Request, res: Response) => {
    res.clearCookie(SESSION_COOKIE, cookieOptions());
    res.status(204).send();
  },

  me: async (_req: Request, res: Response) => {
    res.status(200).json(currentUser(res));
  },
};

export default AuthController;
