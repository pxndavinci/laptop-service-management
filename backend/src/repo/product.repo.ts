import db from '../db/index';
import * as dto from '../dto/product.dto';
import { Product } from '../model/product.model';

export const productRepo = {
    async getProducts(params: dto.ProductQueryParams) : Promise<[Product[], number]> {
        let query = `SELECT * FROM product_data WHERE 1=1`;
        let values: any[] = [];
        let idx: number = 1;
        if (params.product_id) {
            query += ` AND product_id = $${idx}::uuid`;
            values.push(params.product_id);
            idx++;
        }
        if (params.product_name) {
            query += ` AND product_name ILIKE $${idx}::text`;
            values.push(`%${params.product_name}%`);
            idx++;
        }
        if (params.brand_id) {
            query += ` AND email ILIKE $${idx}::uuid`;
            values.push(`%${params.brand_id}%`);
            idx++;
        }
        if (params.product_type_id !== undefined) {
            query += ` AND role_id = $${idx}::uuid`;
            values.push(params.product_type_id);
            idx++;
        }
        query += ` LIMIT $${idx}::int`;
        values.push(params.limit);
        idx++;
        query += ` OFFSET $${idx}::int`;
        values.push(params.offset);
        idx++;
        const result = (await db.query(query, values));
        return [result.rows as Product[], result.rowCount ?? 0];
    },
    async createProduct(params: dto.CreateProduct) : Promise<Product> {
        const query = `
            INSERT INTO product_data (product_name, brand_id, product_type_id)
            VALUES ($1::text, $2::uuid, $3::uuid)
            RETURNING *;
        `;
        const values = [
            params.product_name,
            params.brand_id,
            params.product_type_id
        ];
        const result: Product = (await db.query(query, values)).rows[0];
        return result;
    },
    async updateProduct(product_id: string, params: dto.UpdateOrDeleteProduct) : Promise<Product | null> {
        let query = `UPDATE product_data SET `;
        let values: any[] = [];
        let idx: number = 1;
        const updates: string[] = [];

        if (params.product_name !== undefined) {
            updates.push(`product_name = $${idx}::text`);
            values.push(params.product_name);
            idx++;
        }

        if (params.brand_id !== undefined) {
            updates.push(`brand_id = $${idx}::uuid`);
            values.push(params.brand_id);
            idx++;
        }

        if (params.product_type_id !== undefined) {
            updates.push(`product_type_id = $${idx}::uuid`);
            values.push(params.product_type_id);
            idx++;
        }

        if (updates.length === 0) {
            return null;
        }

        query += updates.join(', ') + ` WHERE product_id = $${idx}::uuid RETURNING *;`;
        values.push(product_id);
        const result: Product = (await db.query(query, values)).rows[0];
        return result ?? null;
    },
    async deleteProduct(product_id: string)  {
        let query = `DELETE FROM product_data WHERE product_id = $1::uuid;`;
        return await db.query(query, [product_id]);
    }
};