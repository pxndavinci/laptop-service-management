import db from '../db/index';

export const referenceRepo = {
    async getallRole() {
        const query = `SELECT * FROM role;`;
        return await db.query(query);
    },
    async createRole(data: { role_id: number; role_name: string; is_customer: boolean; is_business: boolean; is_servicer: boolean }) {
        console.log(
            'inside create role repository:',
            data.role_name,
            data.is_customer
        );

        const query = `
        INSERT INTO role (
            role_id,
            role_name,
            is_customer,
            is_business,
            is_servicer
        )
        VALUES ($1::numeric, $2::text, $3::boolean, $4::boolean, $5::boolean)
        RETURNING *;
        `;

        const values = [
            data.role_id,
            data.role_name,
            data.is_customer,
            data.is_business,
            data.is_servicer
        ];

        return await db.query(query, values);

    },
}