import { ConflictError } from '../middlewares/error.middleware';

/**
 * Turns a Postgres unique violation on one of the named constraints into a
 * 409 with a specific message; any other error is returned unchanged.
 */
export const mapUniqueViolation = (error: unknown, messages: Record<string, string>): unknown => {
  const dbError = error as { code?: string; constraint?: string };
  if (dbError.code === '23505' && dbError.constraint && messages[dbError.constraint]) {
    return new ConflictError(messages[dbError.constraint]);
  }
  return error;
};

/** Runs `fn`, translating the named unique violations into 409s. */
export const withUniqueMessages = async <T>(
  messages: Record<string, string>,
  fn: () => Promise<T>
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    throw mapUniqueViolation(error, messages);
  }
};
