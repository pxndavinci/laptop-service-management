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

router.post('/login', loginLimiter, AuthController.login);
router.post('/logout', AuthController.logout);
router.get('/me', AuthController.me);

export default router;
