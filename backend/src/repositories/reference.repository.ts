import db from '../db/index';

export const referenceRepository = {
    async getallRole() {
        const query = `SELECT * FROM role;`;
        return (await db.query(query)).rows[0];
    },
    async createRole(data: { role_name: string; is_customer: boolean; is_business: boolean; is_servicer: boolean }) {
        console.log(
            'inside create role repository:',
            data.role_name,
            data.is_customer
        );

        const query = `
        INSERT INTO role (
            role_name,
            is_customer,
            is_business,
            is_servicer
        )
        VALUES ($1::text, $2::boolean, $3::boolean, $4::boolean)
        RETURNING *;
        `;

        const values = [
            data.role_name,
            data.is_customer,
            data.is_business,
            data.is_servicer
        ];

        const result = await db.query(query, values);
        return result.rows[0];

    },
}