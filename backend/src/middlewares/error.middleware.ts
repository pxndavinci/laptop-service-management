import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Invalid request') {
    super(message, 400);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflicts with existing data') {
    super(message, 409);
  }
}

// Postgres error codes translated into client-facing responses
const PG_ERROR_RESPONSES: Record<string, { status: number; error: string }> = {
  '23505': { status: 409, error: 'A record with the same unique value already exists' },
  '23503': { status: 400, error: 'A referenced record does not exist' },
  '23514': { status: 400, error: 'Submitted data violates a data constraint' },
  '22P02': { status: 400, error: 'Submitted data has an invalid format' },
};

// Express recognizes error middleware by its four-argument signature
export function errorMiddleware(err: Error, _req: Request, res: Response, _next: NextFunction) {
  console.error(err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // express-openapi-validator errors carry an HTTP status and a detail list
  const validationError = err as Error & { status?: number; errors?: unknown };
  if (typeof validationError.status === 'number') {
    return res
      .status(validationError.status)
      .json({ error: err.message, details: validationError.errors });
  }

  const pgResponse = PG_ERROR_RESPONSES[(err as Error & { code?: string }).code ?? ''];
  if (pgResponse) {
    return res.status(pgResponse.status).json({ error: pgResponse.error });
  }

  return res.status(500).json({ error: 'Internal Server Error' });
}
