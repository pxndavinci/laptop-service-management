import { NextFunction, Request, Response } from 'express';
import authService, { SESSION_COOKIE } from '../services/auth.service';
import { AuthUser } from '../models/auth.model';

/** Rejects requests without a valid staff session; stores the user on res.locals. */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  res.locals.authUser = await authService.verifySession(req.cookies?.[SESSION_COOKIE]);
  next();
}

/** The logged-in staff member. Only valid on routes behind requireAuth. */
export function currentUser(res: Response): AuthUser {
  const user = res.locals.authUser as AuthUser | undefined;
  if (!user) throw new Error('currentUser() called on a route without requireAuth');
  return user;
}
