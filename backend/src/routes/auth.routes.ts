import express, { Router } from 'express';
import rateLimit from 'express-rate-limit';
import AuthController from '../controllers/auth.controller';

const router: Router = express.Router();

// Brute-force protection: 10 failed attempts per IP per 15 minutes.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Try again in 15 minutes.' },
});

// Backstop across all clients: per-IP limits can be sidestepped by rotating
// IPs or spoofing forwarded headers on the LAN; this caps total guesses.
const globalLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  skipSuccessfulRequests: true,
  keyGenerator: () => 'all-clients',
  standardHeaders: false,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Try again in 15 minutes.' },
});

router.post('/login', globalLoginLimiter, loginLimiter, AuthController.login);
router.post('/logout', AuthController.logout);
router.get('/me', AuthController.me);

export default router;
