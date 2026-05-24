import db from '../db/index';

export const referenceRepo = {
  async getAllRole() {
    const query = `SELECT * FROM role;`;
    return (await db.query(query)).rows;
  },

  async createRole(data: { roleName: string; isCustomer: boolean; isBusiness: boolean; isServicer: boolean }) {
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
      data.roleName,
      data.isCustomer,
      data.isBusiness,
      data.isServicer,
    ];

    return (await db.query(query, values)).rows[0];
  },

  async updateRole(roleId: number, data: { roleName?: string; isCustomer?: boolean; isBusiness?: boolean; isServicer?: boolean }) {
    let query = `UPDATE role SET `;
    const updates: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (data.roleName !== undefined) {
      updates.push(`role_name = $${idx}::text`);
      values.push(data.roleName);
      idx++;
    }
    if (data.isCustomer !== undefined) {
      updates.push(`is_customer = $${idx}::boolean`);
      values.push(data.isCustomer);
      idx++;
    }
    if (data.isBusiness !== undefined) {
      updates.push(`is_business = $${idx}::boolean`);
      values.push(data.isBusiness);
      idx++;
    }
    if (data.isServicer !== undefined) {
      updates.push(`is_servicer = $${idx}::boolean`);
      values.push(data.isServicer);
      idx++;
    }

    if (updates.length === 0) {
      return null;
    }

    query += updates.join(', ') + ` WHERE role_id = $${idx}::numeric RETURNING *;`;
    values.push(roleId);

    return (await db.query(query, values)).rows[0] ?? null;
  },

  async deleteRole(roleId: number) {
    const query = `DELETE FROM role WHERE role_id = $1::numeric;`;
    return await db.query(query, [roleId]);
  },

  async getAllBrand() {
    const query: string = `SELECT * FROM brand;`;
    return (await db.query(query)).rows;
  },

  async createBrand(data: { brandName: string }) {
    const query = `
      INSERT INTO brand (
        brand_name
      )
      VALUES ($1::text)
      RETURNING *;
    `;
    const values = [data.brandName];
    return (await db.query(query, values)).rows[0];
  },

  async updateBrand(brandId: string, data: { brandName?: string }) {
    let query = `UPDATE brand SET `;
    const updates: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (data.brandName !== undefined) {
      updates.push(`brand_name = $${idx}::text`);
      values.push(data.brandName);
      idx++;
    }

    if (updates.length === 0) {
      return null;
    }

    query += updates.join(', ') + ` WHERE brand_id = $${idx}::uuid RETURNING *;`;
    values.push(brandId);
    return (await db.query(query, values)).rows[0] ?? null;
  },

  async deleteBrand(brandId: string) {
    const query = `DELETE FROM brand WHERE brand_id = $1::uuid;`;
    return await db.query(query, [brandId]);
  },

  async getAllProductType() {
    const query: string = `SELECT * FROM product_type;`;
    return (await db.query(query)).rows;
  },

  async createProductType(data: { typeName: string }) {
    const query = `
      INSERT INTO product_type (
        product_type_name
      )
      VALUES ($1::text)
      RETURNING *;
    `;
    const values = [data.typeName];
    return (await db.query(query, values)).rows[0];
  },

  async updateProductType(productTypeId: string, data: { typeName?: string }) {
    let query = `UPDATE product_type SET `;
    const updates: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (data.typeName !== undefined) {
      updates.push(`product_type_name = $${idx}::text`);
      values.push(data.typeName);
      idx++;
    }

    if (updates.length === 0) {
      return null;
    }

    query += updates.join(', ') + ` WHERE product_type_id = $${idx}::uuid RETURNING *;`;
    values.push(productTypeId);
    return (await db.query(query, values)).rows[0] ?? null;
  },

  async deleteProductType(productTypeId: string) {
    const query = `DELETE FROM product_type WHERE product_type_id = $1::uuid;`;
    return await db.query(query, [productTypeId]);
  },

  async getAllStatus() {
    const query: string = `SELECT * FROM status;`;
    return (await db.query(query)).rows;
  },

  async createStatus(data: { statusName: string }) {
    const query = `
      INSERT INTO status (
        status_name
      )
      VALUES ($1::text)
      RETURNING *;
    `;
    const values = [data.statusName];
    return (await db.query(query, values)).rows[0];
  },

  async updateStatus(statusId: string, data: { statusName?: string }) {
    let query = `UPDATE status SET `;
    const updates: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (data.statusName !== undefined) {
      updates.push(`status_name = $${idx}::text`);
      values.push(data.statusName);
      idx++;
    }

    if (updates.length === 0) {
      return null;
    }

    query += updates.join(', ') + ` WHERE status_id = $${idx}::uuid RETURNING *;`;
    values.push(statusId);
    return (await db.query(query, values)).rows[0] ?? null;
  },

  async deleteStatus(statusId: string) {
    const query = `DELETE FROM status WHERE status_id = $1::uuid;`;
    return await db.query(query, [statusId]);
  },
};