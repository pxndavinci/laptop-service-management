import db from '../db/index';
import * as UserProductModel from '../models/user-product.model';

export const userProductRepo = {
  async getUserProducts(params: UserProductModel.UserProductQueryParams): Promise<[UserProductModel.UserProduct[], number]> {
    let query = `SELECT * FROM user_product WHERE 1=1`;
    let values: any[] = [];
    let idx: number = 1;

    if (params.userId) {
      query += ` AND user_id = $${idx}::uuid`;
      values.push(params.userId);
      idx++;
    }

    if (params.productId) {
      query += ` AND product_id = $${idx}::uuid`;
      values.push(params.productId);
      idx++;
    }

    if (params.serialNumber !== undefined) {
      query += ` AND serial_number ILIKE $${idx}::text`;
      values.push(`%${params.serialNumber}%`);
      idx++;
    }

    query += ` LIMIT $${idx}::int`;
    values.push(params.limit);
    idx++;
    query += ` OFFSET $${idx}::int`;
    values.push(params.offset);
    idx++;

    const result = await db.query(query, values);
    return [result.rows as UserProductModel.UserProduct[], result.rowCount ?? 0];
  },

  async createUserProduct(params: UserProductModel.CreateUserProduct): Promise<UserProductModel.UserProduct> {
    const query = `
      INSERT INTO user_product (user_id, product_id, serial_number, login_password, additional_info)
      VALUES ($1::uuid, $2::uuid, $3::text, $4::text, $5::text)
      RETURNING *;`;
    const values = [
      params.userId,
      params.productId,
      params.serialNumber,
      params.loginPassword ?? null,
      params.additionalInfo ?? null,
    ];
    const result = await db.query(query, values);
    return result.rows[0] as UserProductModel.UserProduct;
  },

  async getUserProductByID(user_product_id: string): Promise<UserProductModel.UserProduct> {
    const query = `SELECT * FROM user_product WHERE user_product_id = $1::uuid;`;
    const result = await db.query(query, [user_product_id]);
    return result.rows[0] as UserProductModel.UserProduct;
  },

  async updateUserProduct(user_product_id: string, params: UserProductModel.PatchUserProduct): Promise<UserProductModel.UserProduct | null> {
    let query = `UPDATE user_product SET `;
    let values: any[] = [];
    let idx: number = 1;
    const updates: string[] = [];

    if (params.userId !== undefined) {
      updates.push(`user_id = $${idx}::uuid`);
      values.push(params.userId);
      idx++;
    }

    if (params.productId !== undefined) {
      updates.push(`product_id = $${idx}::uuid`);
      values.push(params.productId);
      idx++;
    }

    if (params.serialNumber !== undefined) {
      updates.push(`serial_number = $${idx}::text`);
      values.push(params.serialNumber);
      idx++;
    }

    if (params.loginPassword !== undefined) {
      updates.push(`login_password = $${idx}::text`);
      values.push(params.loginPassword);
      idx++;
    }

    if (params.additionalInfo !== undefined) {
      updates.push(`additional_info = $${idx}::text`);
      values.push(params.additionalInfo);
      idx++;
    }

    if (updates.length === 0) {
      return null;
    }

    query += updates.join(', ') + ` WHERE user_product_id = $${idx}::uuid RETURNING *;`;
    values.push(user_product_id);
    const result = await db.query(query, values);
    return result.rows[0] as UserProductModel.UserProduct ?? null;
  },

  async deleteUserProduct(user_product_id: string) {
    const query = `DELETE FROM user_product WHERE user_product_id = $1::uuid;`;
    return await db.query(query, [user_product_id]);
  },
};
