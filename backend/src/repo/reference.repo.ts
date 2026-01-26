import db from '../db/index';

export const referenceRepo = {
    async getAllRole() {
        const query = `SELECT * FROM role;`;
        return (await db.query(query)).rows;
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

        return (await db.query(query, values)).rows[0];

    },

    async getAllBrand(){
        let query: string = `SELECT * FROM brand;`;
        return (await db.query(query)).rows;
    },
    async createBrand(data: {brand_name:string}){
        let query: string = 
        `INSERT INTO brand(
            brand_name
        )
        VALUES($1::text)
        RETURNING *;`;
        const values = [
            data.brand_name
        ]
        return (await db.query(query, values)).rows[0];
    },

    async getAllProductType(){
        let query: string = `SELECT * FROM product_type;`;
        return (await db.query(query)).rows;
    },
    async createProductType(data: {product_type_name:string}){
        let query: string = 
        `INSERT INTO product_type(
            product_type_name
        )
        VALUES($1::text)
        RETURNING *;`;
        const values = [
            data.product_type_name
        ]
        return (await db.query(query, values)).rows[0];
    },
}