import db from '../db/index';

export const userRepository = {
    async getUsers(params: { search?: string; role_id?: number; limit: number; offset: number }) {
        let query = `SELECT * FROM user_data WHERE 1=1`;
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
        query += ` LIMIT $${idx}::int`;
        values.push(params.limit);
        idx++;
        query += ` OFFSET $${idx}::int`;
        values.push(params.offset);
        idx++;
        return (await db.query(query, values)).rows[0];
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
        return (await db.query(query, values)).rows[0];
    },
    async createUser(data: { user_name: string; email: string; role_id: number }) {
        const query = `
            INSERT INTO user_data (user_name, email, role_id)
            VALUES (${data.user_name}::text, ${data.email}::text, ${data.role_id}::int)
            RETURNING *;
        `;
        return  (await db.query(query)).rows[0];
    }
};