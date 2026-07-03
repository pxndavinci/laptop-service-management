import { Kysely, Transaction } from 'kysely';
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

type Database = typeof kysely extends Kysely<infer DB> ? DB : never;

type DbExecutor = Kysely<Database> | Transaction<Database>;

type ContactWithUserId = ComposerContact & {
  userId: string;
};

type UserProductWithRelations = ComposerUserProduct & {
  userId: string;
  productId: string;
};

const mapUserRow = (row: any): ComposerUser => ({
  userId: row.user_id,
  userName: row.user_name,
  email: row.email,
  address: row.address,
  roleId: row.role_id,
});

const mapContactRow = (row: any): ComposerContact => ({
  contactId: row.contact_id,
  contactNumber: row.contact_number,
});

const mapBrandRow = (row: any): ComposerBrand => ({
  brandId: row.brand_id,
  brandName: row.brand_name,
});

const mapProductTypeRow = (row: any): ComposerProductType => ({
  productTypeId: row.product_type_id,
  productTypeName: row.product_type_name,
});

export const serviceOrderComposerRepo = {
  async searchComposer(
    params: ServiceOrderComposerSearchParams
  ) {
    const limit = params.limit ?? 10;

    let query = kysely
      .selectFrom('user_data as u')
      .leftJoin('contact as c', 'c.user_id', 'u.user_id')
      .leftJoin('user_product as up', 'up.user_id', 'u.user_id')
      .leftJoin('product as p', 'p.product_id', 'up.product_id')
      .leftJoin('brand as b', 'b.brand_id', 'p.brand_id')
      .leftJoin(
        'product_type as pt',
        'pt.product_type_id',
        'p.product_type_id'
      )
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
      ]);

    if (params.userName) {
      query = query.where(
        'u.user_name',
        'ilike',
        `%${params.userName}%`
      );
    }

    if (params.email) {
      query = query.where(
        'u.email',
        'ilike',
        `%${params.email}%`
      );
    }

    if (params.contactNumber) {
      query = query.where(
        'c.contact_number',
        'like',
        `${params.contactNumber}%`
      );
    }

    if (params.productName) {
      query = query.where(
        'p.product_name',
        'ilike',
        `%${params.productName}%`
      );
    }

    if (params.brandName) {
      query = query.where(
        'b.brand_name',
        'ilike',
        `%${params.brandName}%`
      );
    }

    if (params.productTypeName) {
      query = query.where(
        'pt.product_type_name',
        'ilike',
        `%${params.productTypeName}%`
      );
    }

    if (params.serialNumber) {
      query = query.where(
        'up.serial_number',
        'like',
        `${params.serialNumber}%`
      );
    }

    return query
      .orderBy('u.created_at', 'desc')
      .limit(limit)
      .execute();
  },

  async getUserById(
    db: DbExecutor,
    userId: string
  ): Promise<ComposerUser | null> {
    const row = await db
      .selectFrom('user_data')
      .select([
        'user_id',
        'user_name',
        'email',
        'address',
        'role_id',
      ])
      .where('user_id', '=', userId)
      .executeTakeFirst();

    return row ? mapUserRow(row) : null;
  },

  async getUserByEmail(
    db: DbExecutor,
    email: string
  ): Promise<ComposerUser | null> {
    const row = await db
      .selectFrom('user_data')
      .select([
        'user_id',
        'user_name',
        'email',
        'address',
        'role_id',
      ])
      .where('email', '=', email)
      .executeTakeFirst();

    return row ? mapUserRow(row) : null;
  },

  async roleExists(
    db: DbExecutor,
    roleId: number
  ): Promise<boolean> {
    const row = await db
      .selectFrom('role')
      .select('role_id')
      .where('role_id', '=', roleId)
      .executeTakeFirst();

    return Boolean(row);
  },

  async createUser(
    db: DbExecutor,
    data: ComposeCustomerInput
  ): Promise<ComposerUser> {
    const result = await db
      .insertInto('user_data')
      .values({
        user_name: data.userName,
        role_id: data.roleId,
        email: data.email || null,
        address: data.address || null,
      })
      .returning([
        'user_id',
        'user_name',
        'email',
        'address',
        'role_id',
      ])
      .executeTakeFirstOrThrow();

    return mapUserRow(result);
  },

  async getContactById(
    db: DbExecutor,
    contactId: string
  ): Promise<ContactWithUserId | null> {
    const row = await db
      .selectFrom('contact')
      .select([
        'contact_id',
        'contact_number',
        'user_id',
      ])
      .where('contact_id', '=', contactId)
      .executeTakeFirst();

    if (!row) {
      return null;
    }

    return {
      contactId: row.contact_id,
      contactNumber: row.contact_number,
      userId: row.user_id,
    };
  },

  async getContactByNumberForUser(
    db: DbExecutor,
    userId: string,
    contactNumber: string
  ): Promise<ComposerContact | null> {
    const row = await db
      .selectFrom('contact')
      .select([
        'contact_id',
        'contact_number',
      ])
      .where('user_id', '=', userId)
      .where('contact_number', '=', contactNumber)
      .executeTakeFirst();

    return row ? mapContactRow(row) : null;
  },

  async createContact(
    db: DbExecutor,
    userId: string,
    data: ComposeContactInput
  ): Promise<ComposerContact> {
    const result = await db
      .insertInto('contact')
      .values({
        user_id: userId,
        contact_number: data.contactNumber,
      })
      .returning([
        'contact_id',
        'contact_number',
      ])
      .executeTakeFirstOrThrow();

    return mapContactRow(result);
  },

  async getBrandByName(
    db: DbExecutor,
    brandName: string
  ): Promise<ComposerBrand | null> {
    const row = await db
      .selectFrom('brand')
      .select([
        'brand_id',
        'brand_name',
      ])
      .where('brand_name', '=', brandName)
      .executeTakeFirst();

    return row ? mapBrandRow(row) : null;
  },

  async getBrandById(
    db: DbExecutor,
    brandId: string
  ): Promise<ComposerBrand | null> {
    const row = await db
      .selectFrom('brand')
      .select([
        'brand_id',
        'brand_name',
      ])
      .where('brand_id', '=', brandId)
      .executeTakeFirst();

    return row ? mapBrandRow(row) : null;
  },

  async createBrand(
    db: DbExecutor,
    brandName: string
  ): Promise<ComposerBrand> {
    const result = await db
      .insertInto('brand')
      .values({
        brand_name: brandName,
      })
      .returning([
        'brand_id',
        'brand_name',
      ])
      .executeTakeFirstOrThrow();

    return mapBrandRow(result);
  },

  async getProductTypeByName(
    db: DbExecutor,
    productTypeName: string
  ): Promise<ComposerProductType | null> {
    const row = await db
      .selectFrom('product_type')
      .select([
        'product_type_id',
        'product_type_name',
      ])
      .where(
        'product_type_name',
        '=',
        productTypeName
      )
      .executeTakeFirst();

    return row ? mapProductTypeRow(row) : null;
  },

  async getProductTypeById(
    db: DbExecutor,
    productTypeId: string
  ): Promise<ComposerProductType | null> {
    const row = await db
      .selectFrom('product_type')
      .select([
        'product_type_id',
        'product_type_name',
      ])
      .where(
        'product_type_id',
        '=',
        productTypeId
      )
      .executeTakeFirst();

    return row ? mapProductTypeRow(row) : null;
  },

  async createProductType(
    db: DbExecutor,
    productTypeName: string
  ): Promise<ComposerProductType> {
    const result = await db
      .insertInto('product_type')
      .values({
        product_type_name: productTypeName,
      })
      .returning([
        'product_type_id',
        'product_type_name',
      ])
      .executeTakeFirstOrThrow();

    return mapProductTypeRow(result);
  },

  async getProductByUnique(
    db: DbExecutor,
    productName: string,
    brandId: string,
    productTypeId: string
  ): Promise<ComposerProduct | null> {
    const row = await db
      .selectFrom('product as p')
      .innerJoin(
        'brand as b',
        'b.brand_id',
        'p.brand_id'
      )
      .innerJoin(
        'product_type as pt',
        'pt.product_type_id',
        'p.product_type_id'
      )
      .select([
        'p.product_id',
        'p.product_name',
        'p.description',

        'b.brand_id',
        'b.brand_name',

        'pt.product_type_id',
        'pt.product_type_name',
      ])
      .where(
        'p.product_name',
        '=',
        productName
      )
      .where(
        'p.brand_id',
        '=',
        brandId
      )
      .where(
        'p.product_type_id',
        '=',
        productTypeId
      )
      .executeTakeFirst();

    if (!row) {
      return null;
    }

    return {
      productId: row.product_id,
      productName: row.product_name,
      description: row.description,

      brand: {
        brandId: row.brand_id,
        brandName: row.brand_name,
      },

      productType: {
        productTypeId: row.product_type_id,
        productTypeName: row.product_type_name,
      },
    };
  },

  async getProductById(
    db: DbExecutor,
    productId: string
  ): Promise<ComposerProduct | null> {
    const row = await db
      .selectFrom('product as p')
      .innerJoin(
        'brand as b',
        'b.brand_id',
        'p.brand_id'
      )
      .innerJoin(
        'product_type as pt',
        'pt.product_type_id',
        'p.product_type_id'
      )
      .select([
        'p.product_id',
        'p.product_name',
        'p.description',

        'b.brand_id',
        'b.brand_name',

        'pt.product_type_id',
        'pt.product_type_name',
      ])
      .where(
        'p.product_id',
        '=',
        productId
      )
      .executeTakeFirst();

    if (!row) {
      return null;
    }

    return {
      productId: row.product_id,
      productName: row.product_name,
      description: row.description,

      brand: {
        brandId: row.brand_id,
        brandName: row.brand_name,
      },

      productType: {
        productTypeId: row.product_type_id,
        productTypeName: row.product_type_name,
      },
    };
  },

  async createProduct(
    db: DbExecutor,
    product: ComposeProductInput,
    brandId: string,
    productTypeId: string
  ): Promise<ComposerProduct> {
    const result = await db
      .insertInto('product')
      .values({
        product_name: product.productName,
        description: product.description || null,
        brand_id: brandId,
        product_type_id: productTypeId,
      })
      .returning([
        'product_id',
        'product_name',
        'description',
      ])
      .executeTakeFirstOrThrow();

    return {
      productId: result.product_id,
      productName: result.product_name,
      description: result.description,

      brand: {
        brandId,
        brandName: product.brandName,
      },

      productType: {
        productTypeId,
        productTypeName: product.productTypeName,
      },
    };
  },

  async getUserProductById(
    db: DbExecutor,
    userProductId: string
  ): Promise<UserProductWithRelations | null> {
    const row = await db
      .selectFrom('user_product')
      .select([
        'user_product_id',
        'user_id',
        'product_id',
        'serial_number',
        'login_password',
        'additional_info',
      ])
      .where(
        'user_product_id',
        '=',
        userProductId
      )
      .executeTakeFirst();

    if (!row) {
      return null;
    }

    return {
      userProductId: row.user_product_id,
      userId: row.user_id,
      productId: row.product_id,
      serialNumber: row.serial_number,
      loginPassword: row.login_password,
      additionalInfo: row.additional_info,
    };
  },

  async getUserProductBySerial(
    db: DbExecutor,
    serialNumber: string
  ): Promise<UserProductWithRelations | null> {
    const row = await db
      .selectFrom('user_product')
      .select([
        'user_product_id',
        'user_id',
        'product_id',
        'serial_number',
        'login_password',
        'additional_info',
      ])
      .where(
        'serial_number',
        '=',
        serialNumber
      )
      .executeTakeFirst();

    if (!row) {
      return null;
    }

    return {
      userProductId: row.user_product_id,
      userId: row.user_id,
      productId: row.product_id,
      serialNumber: row.serial_number,
      loginPassword: row.login_password,
      additionalInfo: row.additional_info,
    };
  },

  async createUserProduct(
    db: DbExecutor,
    userId: string,
    productId: string,
    data: ComposeUserProductInput
  ): Promise<ComposerUserProduct> {
    const result = await db
      .insertInto('user_product')
      .values({
        user_id: userId,
        product_id: productId,
        serial_number: data.serialNumber,
        login_password: data.loginPassword || null,
        additional_info: data.additionalInfo || null,
      })
      .returning([
        'user_product_id',
        'serial_number',
        'login_password',
        'additional_info',
      ])
      .executeTakeFirstOrThrow();

    return {
      userProductId: result.user_product_id,
      serialNumber: result.serial_number,
      loginPassword: result.login_password,
      additionalInfo: result.additional_info,
    };
  },

  async createServiceOrder(
    db: DbExecutor,
    userProductId: string,
    serviceOrder: ComposeServiceOrderInput
  ) {
    return db
      .insertInto('service_order')
      .values({
        user_product_id: userProductId,
        estimated_price:
          serviceOrder.estimatedPrice ?? null,
        payment_method: null,
        payment_status: 'PENDING',
        priority_level:
          serviceOrder.priorityLevel,
        estimated_completion_date:
          serviceOrder.estimatedCompletionDate ?? null,
        issue_description:
          serviceOrder.issueDescription,
        issue_notes:
          serviceOrder.issueNotes || null,
        entry_by:
          serviceOrder.entryByUserId,
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  },
};

export default serviceOrderComposerRepo;
