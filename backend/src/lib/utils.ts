import { BadRequestError } from '../middlewares/error.middleware';

export interface Pagination {
  page: number;
  limit: number;
  offset: number;
}

export function paginate(page?: number, limit?: number): Pagination {
  const safePage = page && page > 0 ? page : 1;
  const safeLimit = limit && limit > 0 && limit <= 100 ? limit : 10;
  return { page: safePage, limit: safeLimit, offset: (safePage - 1) * safeLimit };
}

/** Rejects PATCH bodies where every field is undefined. */
export function requireAnyField(data: object) {
  if (Object.values(data).every((value) => value === undefined)) {
    throw new BadRequestError('At least one field must be provided');
  }
}
