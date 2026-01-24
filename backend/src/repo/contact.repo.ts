import db from '../db/index';
import * as dto from '../dto/contact.dto';

export const contactRepo = {
    async getContacts(params: dto.ContactQueryParams) {
        let query = `SELECT * FROM contact WHERE 1=1`;
        let values: any[] = [];
        let idx: number = 1;
        if (params.contact_id) {
            query += ` AND contact_id = $${idx}::string`;
            values.push(params.contact);
            idx++;
        }
        if (params.search) {
            query += ` AND (user_name ILIKE $${idx}::text OR email ILIKE $${idx}::text)`;
            values.push(`%${params.search}%`);
            idx++;
        }
        if (params.role_id !== undefined) {
            query += ` AND role_id = $${idx}::int`;
            values.push(params.role_id);
            idx++;
        }
        query += ` LIMIT $${idx}::int`;
        values.push(params.limit);
        idx++;
        query += ` OFFSET $${idx}::int`;
        values.push(params.offset);
        idx++;
        return await db.query(query, values);
    },
    async countUsers(params: { search?: string; role_id?: number }) {
        let query = `SELECT COUNT(*) FROM user_data WHERE 1=1`;
        let values: any[] = [];
        let idx: number = 1;

        if (params.search) {
            query += ` AND (user_name ILIKE $${idx}::text OR email ILIKE $${idx}::text)`;
            values.push(`%${params.search}%`);
            idx++;
        }

        if (params.role_id !== undefined) {
            query += ` AND role_id = $${idx}::int`;
            values.push(params.role_id);
            idx++;
        }
        return await db.query(query, values);
    },
    async createUser(params: dto.CreateUser) {
        const query = `
            INSERT INTO user_data (user_name, email, address, role_id)
            VALUES ($1::text, $2::text, $3::text, $4::int)
            RETURNING *;
        `;
        const values = [
            params.user_name,
            params.email,
            params.address,
            params.role_id
        ];
        return await db.query(query, values);
    },
    async updateUser(user_id: string, params: dto.UpdateOrDeleteUser) {
        let query = `UPDATE user_data SET `;
        let values: any[] = [];
        let idx: number = 1;
        const updates: string[] = [];

        if (params.user_name !== undefined) {
            updates.push(`user_name = $${idx}::text`);
            values.push(params.user_name);
            idx++;
        }

        if (params.email !== undefined) {
            updates.push(`email = $${idx}::text`);
            values.push(params.email);
            idx++;
        }

        if (params.address !== undefined) {
            updates.push(`address = $${idx}::text`);
            values.push(params.address);
            idx++;
        }

        if (params.role_id !== undefined) {
            updates.push(`role_id = $${idx}::int`);
            values.push(params.role_id);
            idx++;
        }

        if (updates.length === 0) {
            return null;
        }

        query += updates.join(', ') + ` WHERE user_id = $${idx}::string RETURNING *;`;
        values.push(user_id);

        return await db.query(query, values);
    },
    async deleteUser(user_id: string, params: dto.UpdateOrDeleteUser) {
        const query = `DELETE FROM user_data WHERE user_id = $1::string;`;
        let values: any[] = [];
        let idx: number = 1;

        if (params.user_name !== undefined) {
            values.push(` AND user_name = $${idx}::text`);
            values.push(params.user_name);
            idx++;
        }

        if (params.email !== undefined) {
            values.push(` ANDemail = $${idx}::text`);
            values.push(params.email);
            idx++;
        }

        if (params.address !== undefined) {
            values.push(` AND address = $${idx}::text`);
            values.push(params.address);
            idx++;
        }

        if (params.role_id !== undefined) {
            values.push(` AND role_id = $${idx}::int`);
            values.push(params.role_id);
            idx++;
        }
        
        return await db.query(query, values);
    }
};