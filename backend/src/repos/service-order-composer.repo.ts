import { PoolClient } from 'pg';
import db from '../db/index';
import { kysely } from '../db/kysely';
import {
  ServiceOrderComposerSearchParams,
  ComposerUser,
  ComposerContact,
  ComposerProduct,
  ComposerBrand,
  ComposerProductType,
  ComposerUserProduct,
  ComposeCustomerInput,
  ComposeContactInput,
  ComposeProductInput,
  ComposeUserProductInput,
  ComposeServiceOrderInput,
} from '../models/service-order-composer.model';

const query = async (sql: string, values: any[], client?: PoolClient) => {
  if (client) {
    return await client.query(sql, values);
  }
  return await db.query(sql, values);
};

const mapUserRow = (row: any): ComposerUser => ({
  userId: row.user_id ?? row.userId,
  userName: row.user_name ?? row.userName,
  email: row.email,
  address: row.address,
  roleId: row.role_id ?? row.roleId,
});

const mapContactRow = (row: any): ComposerContact => ({
  contactId: row.contact_id ?? row.contactId,
  contactNumber: row.contact_number ?? row.contactNumber,
});

const mapBrandRow = (row: any): ComposerBrand => ({
  brandId: row.brand_id ?? row.brandId,
  brandName: row.brand_name ?? row.brandName,
});

const mapProductTypeRow = (row: any): ComposerProductType => ({
  productTypeId: row.product_type_id ?? row.productTypeId,
  productTypeName: row.product_type_name ?? row.productTypeName,
});

const mapProductRow = (row: any): ComposerProduct => ({
  productId: row.product_id ?? row.productId,
  productName: row.product_name ?? row.productName,
  description: row.description,
  brand: {
    brandId: row.brand_id ?? row.brand?.brandId ?? row.brandId,
    brandName: row.brand_name ?? row.brand?.brandName ?? row.brandName,
  },
  productType: {
    productTypeId: row.product_type_id ?? row.productTypeId,
    productTypeName: row.product_type_name ?? row.productTypeName,
  },
});

export const serviceOrderComposerRepo = {
  async searchComposer(params: ServiceOrderComposerSearchParams): Promise<any[]> {
    const limit = params.limit ?? 10;

    let q = kysely
      .selectFrom('user_data as u')
      .leftJoin('contact as c', 'c.user_id', 'u.user_id')
      .leftJoin('user_product as up', 'up.user_id', 'u.user_id')
      .leftJoin('product as p', 'p.product_id', 'up.product_id')
      .leftJoin('brand as b', 'b.brand_id', 'p.brand_id')
      .leftJoin('product_type as pt', 'pt.product_type_id', 'p.product_type_id')
      .select([
        'u.user_id',
        'u.user_name',
        'u.created_at',
        'u.email',
        'u.address',
        'u.role_id',
        'c.contact_id',
        'c.contact_number',
        'p.product_id',
        'p.product_name',
        'p.description',
        'b.brand_id',
        'b.brand_name',
        'pt.product_type_id',
        'pt.product_type_name',
        'up.user_product_id',
        'up.serial_number',
        'up.login_password',
        'up.additional_info',
      ])

    if (params.userName) {
      q = q.where('u.user_name', 'ilike', `%${params.userName}%`)
    }

    if (params.email) {
      q = q.where('u.email', 'ilike', `%${params.email}%`)
    }

    if (params.contactNumber) {
      q = q.where('c.contact_number', 'like', `${params.contactNumber}%`)
    }

    if (params.productName) {
      q = q.where('p.product_name', 'ilike', `%${params.productName}%`)
    }

    if (params.brandName) {
      q = q.where('b.brand_name', 'ilike', `%${params.brandName}%`)
    }

    if (params.productTypeName) {
      q = q.where('pt.product_type_name', 'ilike', `%${params.productTypeName}%`)
    }

    if (params.serialNumber) {
      q = q.where('up.serial_number', 'like', `${params.serialNumber}%`)
    }

    const rows = await q.orderBy('u.created_at', 'desc').limit(limit).execute()
    return rows
  },

  async getUserById(userId: string, client?: PoolClient): Promise<ComposerUser | null> {
    const sql = `SELECT user_id, user_name, email, address, role_id FROM user_data WHERE user_id = $1::uuid`;
    const result = await query(sql, [userId], client);
    return result.rows[0] ? mapUserRow(result.rows[0]) : null;
  },

  async getUserByEmail(email: string, client?: PoolClient): Promise<ComposerUser | null> {
    const sql = `SELECT user_id, user_name, email, address, role_id FROM user_data WHERE email = $1`;
    const result = await query(sql, [email], client);
    return result.rows[0] ? mapUserRow(result.rows[0]) : null;
  },

  async createUser(data: ComposeCustomerInput, client?: PoolClient): Promise<ComposerUser> {
    const sql = `
      INSERT INTO user_data (user_name, role_id, email, address)
      VALUES ($1, $2::numeric, $3, $4)
      RETURNING user_id, user_name, email, address, role_id;
    `;
    const values = [data.userName, data.roleId, data.email ?? null, data.address ?? null];
    const result = await query(sql, values, client);
    return mapUserRow(result.rows[0]);
  },

  async getContactById(contactId: string, client?: PoolClient): Promise<ComposerContact | null> {
    const sql = `SELECT contact_id, contact_number FROM contact WHERE contact_id = $1::uuid`;
    const result = await query(sql, [contactId], client);
    return result.rows[0] ? mapContactRow(result.rows[0]) : null;
  },

  async getContactByNumberForUser(userId: string, contactNumber: string, client?: PoolClient): Promise<ComposerContact | null> {
    const sql = `SELECT contact_id, contact_number FROM contact WHERE user_id = $1::uuid AND contact_number = $2`;
    const result = await query(sql, [userId, contactNumber], client);
    return result.rows[0] ? mapContactRow(result.rows[0]) : null;
  },

  async createContact(userId: string, data: ComposeContactInput, client?: PoolClient): Promise<ComposerContact> {
    const sql = `
      INSERT INTO contact (user_id, contact_number)
      VALUES ($1::uuid, $2)
      RETURNING contact_id, contact_number;
    `;
    const result = await query(sql, [userId, data.contactNumber], client);
    return mapContactRow(result.rows[0]);
  },

  async getBrandByName(brandName: string, client?: PoolClient): Promise<ComposerBrand | null> {
    const sql = `SELECT brand_id, brand_name FROM brand WHERE brand_name = $1`;
    const result = await query(sql, [brandName], client);
    return result.rows[0] ? mapBrandRow(result.rows[0]) : null;
  },

  async getBrandById(brandId: string, client?: PoolClient): Promise<ComposerBrand | null> {
    if (client) {
      const sql = `SELECT brand_id, brand_name FROM brand WHERE brand_id = $1::uuid`;
      const result = await query(sql, [brandId], client);
      return result.rows[0] ? mapBrandRow(result.rows[0]) : null;
    }

    const row = await kysely
      .selectFrom('brand')
      .select(['brand_id as "brandId"', 'brand_name as "brandName"'])
      .where('brand_id', '=', brandId)
      .executeTakeFirst()

    return row ?? null;
  },

  async createBrand(brandName: string, client?: PoolClient): Promise<ComposerBrand> {
    if (client) {
      const sql = `INSERT INTO brand (brand_name) VALUES ($1) RETURNING brand_id, brand_name;`;
      const result = await query(sql, [brandName], client);
      return mapBrandRow(result.rows[0]);
    }

    const result = await kysely
      .insertInto('brand')
      .values({ brand_name: brandName })
      .returning(['brand_id', 'brand_name'])
      .executeTakeFirst()

    return { brandId: result!.brand_id, brandName: result!.brand_name } as ComposerBrand;
  },

  async getProductTypeByName(productTypeName: string, client?: PoolClient): Promise<ComposerProductType | null> {
    if (client) {
      const sql = `SELECT product_type_id, product_type_name FROM product_type WHERE product_type_name = $1`;
      const result = await query(sql, [productTypeName], client);
      return result.rows[0] ? mapProductTypeRow(result.rows[0]) : null;
    }

    const row = await kysely
      .selectFrom('product_type')
      .select(['product_type_id as "productTypeId"', 'product_type_name as "productTypeName"'])
      .where('product_type_name', '=', productTypeName)
      .executeTakeFirst()

    return row ?? null;
  },

  async getProductTypeById(productTypeId: string, client?: PoolClient): Promise<ComposerProductType | null> {
    if (client) {
      const sql = `SELECT product_type_id, product_type_name FROM product_type WHERE product_type_id = $1::uuid`;
      const result = await query(sql, [productTypeId], client);
      return result.rows[0] ? mapProductTypeRow(result.rows[0]) : null;
    }

    const row = await kysely
      .selectFrom('product_type')
      .select(['product_type_id as "productTypeId"', 'product_type_name as "productTypeName"'])
      .where('product_type_id', '=', productTypeId)
      .executeTakeFirst()

    return row ?? null;
  },

  async createProductType(productTypeName: string, client?: PoolClient): Promise<ComposerProductType> {
    if (client) {
      const sql = `INSERT INTO product_type (product_type_name) VALUES ($1) RETURNING product_type_id, product_type_name;`;
      const result = await query(sql, [productTypeName], client);
      return mapProductTypeRow(result.rows[0]);
    }

    const result = await kysely
      .insertInto('product_type')
      .values({ product_type_name: productTypeName })
      .returning(['product_type_id', 'product_type_name'])
      .executeTakeFirst()

    return { productTypeId: result!.product_type_id, productTypeName: result!.product_type_name } as ComposerProductType;
  },

  async getProductByUnique(productName: string, brandId: string, productTypeId: string, client?: PoolClient): Promise<ComposerProduct | null> {
    if (client) {
      const sql = `
      SELECT p.product_id, p.product_name, p.description, b.brand_id, b.brand_name, pt.product_type_id, pt.product_type_name
      FROM product p
      JOIN brand b ON b.brand_id = p.brand_id
      JOIN product_type pt ON pt.product_type_id = p.product_type_id
      WHERE p.product_name = $1 AND p.brand_id = $2::uuid AND p.product_type_id = $3::uuid
    `;
      const result = await query(sql, [productName, brandId, productTypeId], client);
      return result.rows[0] ? mapProductRow(result.rows[0]) : null;
    }

    const row = await kysely
      .selectFrom('product as p')
      .select([
        'p.product_id as "productId"',
        'p.product_name as "productName"',
        'p.description',
        'b.brand_id as "brandId"',
        'b.brand_name as "brandName"',
        'pt.product_type_id as "productTypeId"',
        'pt.product_type_name as "productTypeName"',
      ])
      .innerJoin('brand as b', 'b.brand_id', 'p.brand_id')
      .innerJoin('product_type as pt', 'pt.product_type_id', 'p.product_type_id')
      .where('p.product_name', '=', productName)
      .where('p.brand_id', '=', brandId)
      .where('p.product_type_id', '=', productTypeId)
      .executeTakeFirst()

    if (!row) return null

    return {
      productId: row.productId,
      productName: row.productName,
      description: row.description,
      brand: { brandId: row.brandId, brandName: row.brandName },
      productType: { productTypeId: row.productTypeId, productTypeName: row.productTypeName },
    } as ComposerProduct;
  },

  async getProductById(productId: string, client?: PoolClient): Promise<ComposerProduct | null> {
    if (client) {
      const sql = `
      SELECT p.product_id, p.product_name, p.description, b.brand_id, b.brand_name, pt.product_type_id, pt.product_type_name
      FROM product p
      JOIN brand b ON b.brand_id = p.brand_id
      JOIN product_type pt ON pt.product_type_id = p.product_type_id
      WHERE p.product_id = $1::uuid
    `;
      const result = await query(sql, [productId], client);
      return result.rows[0] ? mapProductRow(result.rows[0]) : null;
    }

    const row = await kysely
      .selectFrom('product as p')
      .select([
        'p.product_id as "productId"',
        'p.product_name as "productName"',
        'p.description',
        'b.brand_id as "brandId"',
        'b.brand_name as "brandName"',
        'pt.product_type_id as "productTypeId"',
        'pt.product_type_name as "productTypeName"',
      ])
      .innerJoin('brand as b', 'b.brand_id', 'p.brand_id')
      .innerJoin('product_type as pt', 'pt.product_type_id', 'p.product_type_id')
      .where('p.product_id', '=', productId)
      .executeTakeFirst()

    if (!row) return null

    return {
      productId: row.productId,
      productName: row.productName,
      description: row.description,
      brand: { brandId: row.brandId, brandName: row.brandName },
      productType: { productTypeId: row.productTypeId, productTypeName: row.productTypeName },
    } as ComposerProduct;
  },
  async createProduct(product: ComposeProductInput, brandId: string, productTypeId: string, client?: PoolClient): Promise<ComposerProduct> {
    if (client) {
      const sql = `
      INSERT INTO product (product_name, description, brand_id, product_type_id)
      VALUES ($1, $2, $3::uuid, $4::uuid)
      RETURNING product_id, product_name, description, brand_id, product_type_id;
    `;
      const result = await query(sql, [product.productName, product.description ?? null, brandId, productTypeId], client);
      return mapProductRow({
        product_id: result.rows[0].product_id,
        product_name: result.rows[0].product_name,
        description: result.rows[0].description,
        brand_id: brandId,
        brand_name: product.brandName,
        product_type_id: productTypeId,
        product_type_name: product.productTypeName,
      });
    }

    const result = await kysely
      .insertInto('product')
      .values({ product_name: product.productName, description: product.description ?? null, brand_id: brandId, product_type_id: productTypeId })
      .returning(['product_id', 'product_name', 'description'])
      .executeTakeFirst()

    return {
      productId: result!.product_id,
      productName: result!.product_name,
      description: result!.description,
      brand: { brandId, brandName: product.brandName },
      productType: { productTypeId, productTypeName: product.productTypeName },
    } as ComposerProduct;
  },
  async getUserProductById(userProductId: string, client?: PoolClient): Promise<ComposerUserProduct | null> {
    if (client) {
      const sql = `
      SELECT user_product_id AS "userProductId", serial_number AS "serialNumber", login_password AS "loginPassword", additional_info AS "additionalInfo"
      FROM user_product
      WHERE user_product_id = $1::uuid
    `;
      const result = await query(sql, [userProductId], client);
      return result.rows[0] ?? null;
    }

    const row = await kysely
      .selectFrom('user_product')
      .select([
        'user_product_id as "userProductId"',
        'serial_number as "serialNumber"',
        'login_password as "loginPassword"',
        'additional_info as "additionalInfo"',
      ])
      .where('user_product_id', '=', userProductId)
      .executeTakeFirst()

    return row ?? null;
  },

  async getUserProductBySerial(serialNumber: string, client?: PoolClient): Promise<(ComposerUserProduct & { userId: string; productId: string }) | null> {
    if (client) {
      const sql = `
      SELECT user_product_id AS "userProductId", user_id AS "userId", product_id AS "productId", serial_number AS "serialNumber", login_password AS "loginPassword", additional_info AS "additionalInfo"
      FROM user_product
      WHERE serial_number = $1
    `;
      const result = await query(sql, [serialNumber], client);
      return result.rows[0] ?? null;
    }

    const row = await kysely
      .selectFrom('user_product')
      .select([
        'user_product_id as "userProductId"',
        'user_id as "userId"',
        'product_id as "productId"',
        'serial_number as "serialNumber"',
        'login_password as "loginPassword"',
        'additional_info as "additionalInfo"',
      ])
      .where('serial_number', '=', serialNumber)
      .executeTakeFirst()

    return row ?? null;
  },

  async createUserProduct(userId: string, productId: string, data: ComposeUserProductInput, client?: PoolClient): Promise<ComposerUserProduct> {
    if (client) {
      const sql = `
      INSERT INTO user_product (user_id, product_id, serial_number, login_password, additional_info)
      VALUES ($1::uuid, $2::uuid, $3, $4, $5)
      RETURNING user_product_id, serial_number, login_password, additional_info;
    `;
      const result = await query(sql, [userId, productId, data.serialNumber, data.loginPassword ?? null, data.additionalInfo ?? null], client);
      return {
        userProductId: result.rows[0].user_product_id,
        serialNumber: result.rows[0].serial_number,
        loginPassword: result.rows[0].login_password,
        additionalInfo: result.rows[0].additional_info,
      } as ComposerUserProduct;
    }

    const result = await kysely
      .insertInto('user_product')
      .values({ user_id: userId, product_id: productId, serial_number: data.serialNumber, login_password: data.loginPassword ?? null, additional_info: data.additionalInfo ?? null })
      .returning(['user_product_id', 'serial_number', 'login_password', 'additional_info'])
      .executeTakeFirst()

    return {
      userProductId: result!.user_product_id,
      serialNumber: result!.serial_number,
      loginPassword: result!.login_password,
      additionalInfo: result!.additional_info,
    } as ComposerUserProduct;
  },

  async createServiceOrder(userProductId: string, serviceOrder: ComposeServiceOrderInput, client?: PoolClient): Promise<any> {
    if (client) {
      const sql = `
      INSERT INTO service_order (
        user_product_id, estimated_price, payment_method, payment_status, priority_level, estimated_completion_date, issue_description, issue_notes, entry_by
      ) VALUES ($1::uuid, $2::numeric, $3::text, $4::text, $5::int, $6::timestamptz, $7::text, $8::text, $9::uuid)
      RETURNING *;
    `;
      const values = [
        userProductId,
        serviceOrder.estimatedPrice ?? null,
        null,
        'PENDING',
        serviceOrder.priorityLevel,
        serviceOrder.estimatedCompletionDate ?? null,
        serviceOrder.issueDescription,
        serviceOrder.issueNotes ?? null,
        serviceOrder.entryByUserId,
      ];
      const result = await query(sql, values, client);
      return result.rows[0];
    }

    const inserted = await kysely
      .insertInto('service_order')
      .values({
        user_product_id: userProductId,
        estimated_price: serviceOrder.estimatedPrice ?? null,
        payment_method: null,
        payment_status: 'PENDING',
        priority_level: serviceOrder.priorityLevel,
        estimated_completion_date: serviceOrder.estimatedCompletionDate ?? null,
        issue_description: serviceOrder.issueDescription,
        issue_notes: serviceOrder.issueNotes ?? null,
        entry_by: serviceOrder.entryByUserId,
      })
      .returningAll()
      .executeTakeFirst()

    return inserted;
  },
  async getContactsByUserId(userId: string): Promise<ComposerContact[]> {
    const rows = await kysely
      .selectFrom('contact')
      .select(['contact_id as "contactId"', 'contact_number as "contactNumber"'])
      .where('user_id', '=', userId)
      .orderBy('created_at', 'desc')
      .execute()

    return rows.map(r => ({ contactId: r.contactId, contactNumber: r.contactNumber }));
  },

  async getLatestUserProductForUser(userId: string): Promise<any | null> {
    const row = await kysely
      .selectFrom('user_product as up')
      .select([
        'up.user_product_id as "userProductId"',
        'up.serial_number as "serialNumber"',
        'up.login_password as "loginPassword"',
        'up.additional_info as "additionalInfo"',
        'p.product_id as "productId"',
        'p.product_name as "productName"',
        'p.description',
        'b.brand_id as "brandId"',
        'b.brand_name as "brandName"',
        'pt.product_type_id as "productTypeId"',
        'pt.product_type_name as "productTypeName"',
      ])
      .innerJoin('product as p', 'p.product_id', 'up.product_id')
      .innerJoin('brand as b', 'b.brand_id', 'p.brand_id')
      .innerJoin('product_type as pt', 'pt.product_type_id', 'p.product_type_id')
      .where('up.user_id', '=', userId)
      .orderBy('up.created_at', 'desc')
      .limit(1)
      .executeTakeFirst()

    if (!row) return null

    return {
      userProductId: row.userProductId,
      serialNumber: row.serialNumber,
      loginPassword: row.loginPassword,
      additionalInfo: row.additionalInfo,
      product: {
        productId: row.productId,
        productName: row.productName,
        description: row.description,
        brand: { brandId: row.brandId, brandName: row.brandName },
        productType: { productTypeId: row.productTypeId, productTypeName: row.productTypeName },
      },
    }
  },
};

export default serviceOrderComposerRepo;
