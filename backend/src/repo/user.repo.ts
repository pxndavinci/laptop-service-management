import db from '../db/index';
import * as dto from '../dto/user.dto';
import { User } from '../model/user.model';

export const userRepo = {
    async getUsers(params: dto.UserQueryParams) : Promise<[User[], number]> {
        let query = `SELECT * FROM user_data WHERE 1=1`;
        let values: any[] = [];
        let idx: number = 1;
        if (params.user_id) {
            query += ` AND user_id = $${idx}::int`;
            values.push(params.user_id);
            idx++;
        }
        if (params.user_name) {
            query += ` AND user_name ILIKE $${idx}::text`;
            values.push(`%${params.user_name}%`);
            idx++;
        }
        if (params.email) {
            query += ` AND email ILIKE $${idx}::text`;
            values.push(`%${params.email}%`);
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
        const result = (await db.query(query, values));
        return [result.rows as User[], result.rowCount ?? 0];
    },
    async createUser(params: dto.CreateUser) : Promise<User> {
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
        const result: User = (await db.query(query, values)).rows[0];
        return result;
    },
    async updateUser(user_id: string, params: dto.UpdateOrDeleteUser) : Promise<User | null> {
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
        const result: User = (await db.query(query, values)).rows[0];
        return result ?? null;
    },
    async deleteUser(user_id: string, params: dto.UpdateOrDeleteUser)  {
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