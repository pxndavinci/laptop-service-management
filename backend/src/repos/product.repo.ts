import db from '../db/index';
import * as ProductModel from '../models/product.model';

export const productRepo = {
    async getProducts(params: ProductModel.ProductQueryParams): Promise<[ProductModel.Product[], number]> {
        let query = `SELECT * FROM product WHERE 1=1`;
        let values: any[] = [];
        let idx: number = 1;

        if (params.productName) {
            query += ` AND product_name ILIKE $${idx}::text`;
            values.push(`%${params.productName}%`);
            idx++;
        }

        if (params.brandId) {
            query += ` AND brand_id = $${idx}::uuid`;
            values.push(params.brandId);
            idx++;
        }

        if (params.productTypeId !== undefined) {
            query += ` AND product_type_id = $${idx}::uuid`;
            values.push(params.productTypeId);
            idx++;
        }

        query += ` LIMIT $${idx}::int`;
        values.push(params.limit);
        idx++;
        query += ` OFFSET $${idx}::int`;
        values.push(params.offset);
        idx++;

        const result = await db.query(query, values);
        return [result.rows as ProductModel.Product[], result.rowCount ?? 0];
    },

    async createProduct(params: ProductModel.CreateProduct): Promise<ProductModel.Product> {
        const query = `
            INSERT INTO product (product_name, description, brand_id, product_type_id)
            VALUES ($1::text, $2::text, $3::uuid, $4::uuid)
            RETURNING *;
        `;
        const values = [
            params.productName,
            params.description ?? null,
            params.brandId,
            params.productTypeId,
        ];
        const result = await db.query(query, values);
        return result.rows[0] as ProductModel.Product;
    },

    async getProductByID(product_id: string): Promise<ProductModel.Product> {
        const query = `
        SELECT * FROM product WHERE product_id = $1::uuid;
        `;
        const result = await db.query(query, [product_id]);
        return result.rows[0] as ProductModel.Product;
    },

    async updateProduct(product_id: string, params: ProductModel.PatchProduct): Promise<ProductModel.Product | null> {
        let query = `UPDATE product SET `;
        let values: any[] = [];
        let idx: number = 1;
        const updates: string[] = [];

        if (params.productName !== undefined) {
            updates.push(`product_name = $${idx}::text`);
            values.push(params.productName);
            idx++;
        }

        if (params.description !== undefined) {
            updates.push(`description = $${idx}::text`);
            values.push(params.description);
            idx++;
        }

        if (params.brandId !== undefined) {
            updates.push(`brand_id = $${idx}::uuid`);
            values.push(params.brandId);
            idx++;
        }

        if (params.productTypeId !== undefined) {
            updates.push(`product_type_id = $${idx}::uuid`);
            values.push(params.productTypeId);
            idx++;
        }

        if (updates.length === 0) {
            return null;
        }

        query += updates.join(', ') + ` WHERE product_id = $${idx}::uuid RETURNING *;`;
        values.push(product_id);
        const result = await db.query(query, values);
        return result.rows[0] as ProductModel.Product ?? null;
    },

    async deleteProduct(product_id: string) {
        const query = `DELETE FROM product WHERE product_id = $1::uuid;`;
        return await db.query(query, [product_id]);
    },
};
