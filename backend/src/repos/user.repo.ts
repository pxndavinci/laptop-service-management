import db from '../db/index';
import * as User from '../models/user.model';

export const userRepo = {
    async getUsers(params: User.UserQueryParams) : Promise<[User.User[], number]> {
        let query = `SELECT * FROM user_data WHERE 1=1`;
        let values: any[] = [];
        let idx: number = 1;
        if (params.userName) {
            query += ` AND userName ILIKE $${idx}::text`;
            values.push(`%${params.userName}%`);
            idx++;
        }
        if (params.email) {
            query += ` AND email ILIKE $${idx}::text`;
            values.push(`%${params.email}%`);
            idx++;
        }
        if (params.roleId !== undefined) {
            query += ` AND roleId = $${idx}::int`;
            values.push(params.roleId);
            idx++;
        }
        query += ` LIMIT $${idx}::int`;
        values.push(params.limit);
        idx++;
        query += ` OFFSET $${idx}::int`;
        values.push(params.offset);
        idx++;
        const result = (await db.query(query, values));
        return [result.rows as User.User[], result.rowCount ?? 0];
    },
    async getUserByID(userId: string): Promise<User.User>{
        const query = `
            SELECT * FROM user WHERE userId = $1::uuid;    
        `
        const result = await db.query(query, [userId]);
        return result.rows[0];
    },
    async createUser(params: User.CreateUser) : Promise<User.User> {
        const query = `
            INSERT INTO user_data (user_name, email, role_id)
            VALUES ($1::text, $2::text, $3::int)
            RETURNING *;
        `;
        const values = [
            params.userName,
            params.email,
            params.roleId
        ];
        const result: User.User = (await db.query(query, values)).rows[0];
        return result;
    },
    async updateUser(userId: string, params: User.PatchUser) : Promise<User.User | null> {
        let query = `UPDATE user_data SET `;
        let values: any[] = [];
        let idx: number = 1;
        const updates: string[] = [];

        if (params.userName !== undefined) {
            updates.push(`userName = $${idx}::text`);
            values.push(params.userName);
            idx++;
        }

        if (params.email !== undefined) {
            updates.push(`email = $${idx}::text`);
            values.push(params.email);
            idx++;
        }

        if (params.roleId !== undefined) {
            updates.push(`roleId = $${idx}::int`);
            values.push(params.roleId);
            idx++;
        }

        if (updates.length === 0) {
            return null;
        }

        query += updates.join(', ') + ` WHERE userId = $${idx}::uuid RETURNING *;`;
        values.push(userId);
        const result: User.User = (await db.query(query, values)).rows[0];
        return result ?? null;
    },
    async deleteUser(userId: string)  {
        let query = `DELETE FROM user_data WHERE userId = $1::uuid;`;
        return await db.query(query, [userId]);
    }
};