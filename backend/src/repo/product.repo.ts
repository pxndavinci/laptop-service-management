import db from '../db/index';
import * as dto from '../dto/product.dto';
import { Product } from '../model/product.model';
import { User } from '../model/user.model';
import { User_Product } from '../model/user_product.model';

export const productRepo = {
    async getProducts(params: dto.ProductQueryParams) : Promise<[Product[], number]> {
        let query = `SELECT * FROM product WHERE 1=1`;
        let values: any[] = [];
        let idx: number = 1;
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
            INSERT INTO product (product_name, brand_id, product_type_id)
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
    async getProductByID(product_id: string) : Promise<Product>{
        const query =  `
        SELECT * FROM product WHERE product_id = $1::uuid;
        `;
        const result: Product = (await db.query(query, [product_id])).rows[0];
        return result;
    },
    async updateProduct(product_id: string, params: dto.UpdateOrDeleteProduct) : Promise<Product | null> {
        let query = `UPDATE product SET `;
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
        let query = `DELETE FROM product WHERE product_id = $1::uuid;`;
        return await db.query(query, [product_id]);
    },

    async getUserProducts(params: dto.UserProductQueryParams) : Promise<[User_Product[], number]>{
        let query = `SELECT * FROM user_product WHERE 1=1`;
        let values: any[] = [];
        let idx: number = 1;
        if (params.user_id) {
            query += ` AND product_name ILIKE $${idx}::uuid`;
            values.push(`%${params.user_id}%`);
            idx++;
        }
        if (params.product_id) {
            query += ` AND email ILIKE $${idx}::uuid`;
            values.push(`%${params.product_id}%`);
            idx++;
        }
        if (params.serial_number !== undefined) {
            query += ` AND role_id = $${idx}::text`;
            values.push(params.serial_number);
            idx++;
        }
        query += ` LIMIT $${idx}::int`;
        values.push(params.limit);
        idx++;
        query += ` OFFSET $${idx}::int`;
        values.push(params.offset);
        idx++;
        const result = (await db.query(query, values));
        return [result.rows as User_Product[], result.rowCount ?? 0];
    },
    async createUserProduct(params: dto.CreateUserProduct) : Promise<User_Product>{
        const query = `
        INSERT user_product (user_id, product_id, serial_number, login_password, additional_info)
        VALUES ($1:uudi, $2:uuid, $3::text, $4::text, $5::text)
        RETURNING *;`;
        const values = [params.user_id, params.product_id, params.serial_number, params.login_password, params.additional_info];
        const result: User_Product = (await db.query(query, values)).rows[0];
        return result;
    },
    async getUserProductByID(user_product_id: string) : Promise<User_Product>{
        const query = `
        SELECT * FROM user_product WHERE user_product_id = $1::uuid;`;
        const values = [user_product_id];
        const result: User_Product = (await db.query(query, values)).rows[0];
        return result;
    },
    async updateUserProduct(user_product_id: string, params: dto.UpdateOrDeleteUserProduct) : Promise<Product | null> {
        let query = `UPDATE user_product SET `;
        let values: any[] = [];
        let idx: number = 1;
        const updates: string[] = [];

        if (params.user_id !== undefined) {
            updates.push(`user_id = $${idx}::uuid`);
            values.push(params.user_id);
            idx++;
        }

        if (params.product_id !== undefined) {
            updates.push(`product_id = $${idx}::uuid`);
            values.push(params.product_id);
            idx++;
        }

        if (params.serial_number !== undefined) {
            updates.push(`serial_number = $${idx}::uuid`);
            values.push(params.serial_number);
            idx++;
        }

        if (params.login_password){
            updates.push(`login_password = $${idx}::text`);
            values.push(params.login_password);
            idx++;
        }

        if (params.additional_info){
            updates.push(`additional_info = $${idx}::text`);
            values.push(params.additional_info);
            idx++;
        }

        if (updates.length === 0) {
            return null;
        }

        query += updates.join(', ') + ` WHERE user_product_id = $${idx}::uuid RETURNING *;`;
        values.push(user_product_id);
        const result: Product = (await db.query(query, values)).rows[0];
        return result ?? null;
    },
    async deleteUserProduct(user_product_id: string)  {
        let query = `DELETE FROM product_data WHERE product_id = $1::uuid;`;
        return await db.query(query, [user_product_id]);
    },

};