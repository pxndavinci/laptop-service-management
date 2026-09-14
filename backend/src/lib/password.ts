import bcrypt from 'bcryptjs';

/** ~250 ms per hash on a small server: slow for brute force, fine for one login. */
export const BCRYPT_ROUNDS = 12;
export const MIN_PASSWORD_LENGTH = 10;

export const hashPassword = (plain: string) => bcrypt.hash(plain, BCRYPT_ROUNDS);

/** Returns an error message, or null when the password is acceptable. */
export const passwordProblem = (plain: string | undefined): string | null => {
  if (!plain) return 'password is empty';
  if (plain.length < MIN_PASSWORD_LENGTH) {
    return `password must be at least ${MIN_PASSWORD_LENGTH} characters`;
  }
  return null;
};
