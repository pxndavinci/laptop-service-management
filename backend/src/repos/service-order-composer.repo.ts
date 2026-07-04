import db, { DbExecutor } from '../db/index';
import {
  ComposeCustomerInput,
  ComposeProductInput,
  ComposeServiceOrderInput,
  ComposeUserProductInput,
  ComposerProduct,
  ServiceOrderComposerSearchParams,
  ServiceOrderComposerSearchResult,
} from '../models/service-order-composer.model';

const composerUserColumns = ['userId', 'userName', 'email', 'address', 'roleId'] as const;

const productWithNames = (executor: DbExecutor) =>
  executor
    .selectFrom('product as p')
    .innerJoin('brand as b', 'b.brandId', 'p.brandId')
    .innerJoin('product_type as pt', 'pt.productTypeId', 'p.productTypeId')
    .select([
      'p.productId',
      'p.productName',
      'p.description',
      'b.brandId',
      'b.brandName',
      'pt.productTypeId',
      'pt.productTypeName',
    ]);

type ProductRow = {
  productId: string;
  productName: string;
  description: string | null;
  brandId: string;
  brandName: string;
  productTypeId: string;
  productTypeName: string;
};

const toComposerProduct = (row: ProductRow): ComposerProduct => ({
  productId: row.productId,
  productName: row.productName,
  description: row.description,
  brand: { brandId: row.brandId, brandName: row.brandName },
  productType: { productTypeId: row.productTypeId, productTypeName: row.productTypeName },
});

export const serviceOrderComposerRepo = {
  /**
   * Type-ahead search for the order form. A result is one customer/device
   * pairing; `limit` counts pairings, not joined rows, and every contact of a
   * matched customer is always included.
   */
  async searchContexts(
    params: ServiceOrderComposerSearchParams & { limit: number }
  ): Promise<ServiceOrderComposerSearchResult[]> {
    const contextKeys = await db
      .selectFrom('user_data as u')
      .leftJoin('contact as c', 'c.userId', 'u.userId')
      .leftJoin('user_product as up', 'up.userId', 'u.userId')
      .leftJoin('product as p', 'p.productId', 'up.productId')
      .leftJoin('brand as b', 'b.brandId', 'p.brandId')
      .leftJoin('product_type as pt', 'pt.productTypeId', 'p.productTypeId')
      .select(['u.userId', 'up.userProductId', 'u.createdAt'])
      .distinct()
      .$if(!!params.userName, (qb) => qb.where('u.userName', 'ilike', `%${params.userName}%`))
      .$if(!!params.email, (qb) => qb.where('u.email', 'ilike', `%${params.email}%`))
      .$if(!!params.contactNumber, (qb) =>
        qb.where('c.contactNumber', 'like', `${params.contactNumber}%`)
      )
      .$if(!!params.productName, (qb) =>
        qb.where('p.productName', 'ilike', `%${params.productName}%`)
      )
      .$if(!!params.brandName, (qb) => qb.where('b.brandName', 'ilike', `%${params.brandName}%`))
      .$if(!!params.productTypeName, (qb) =>
        qb.where('pt.productTypeName', 'ilike', `%${params.productTypeName}%`)
      )
      .$if(!!params.serialNumber, (qb) =>
        qb.where('up.serialNumber', 'like', `${params.serialNumber}%`)
      )
      .orderBy('u.createdAt', 'desc')
      .limit(params.limit)
      .execute();

    if (contextKeys.length === 0) {
      return [];
    }

    const userIds = [...new Set(contextKeys.map((key) => key.userId))];
    const userProductIds = contextKeys
      .map((key) => key.userProductId)
      .filter((id): id is string => id !== null);

    const [users, contacts, devices] = await Promise.all([
      db.selectFrom('user_data').select(composerUserColumns).where('userId', 'in', userIds).execute(),
      db
        .selectFrom('contact')
        .select(['contactId', 'contactNumber', 'userId'])
        .where('userId', 'in', userIds)
        .orderBy('createdAt', 'asc')
        .execute(),
      userProductIds.length === 0
        ? []
        : db
            .selectFrom('user_product as up')
            .innerJoin('product as p', 'p.productId', 'up.productId')
            .innerJoin('brand as b', 'b.brandId', 'p.brandId')
            .innerJoin('product_type as pt', 'pt.productTypeId', 'p.productTypeId')
            .select([
              'up.userProductId',
              'up.serialNumber',
              'up.loginPassword',
              'up.additionalInfo',
              'p.productId',
              'p.productName',
              'p.description',
              'b.brandId',
              'b.brandName',
              'pt.productTypeId',
              'pt.productTypeName',
            ])
            .where('up.userProductId', 'in', userProductIds)
            .execute(),
    ]);

    const userById = new Map(users.map((user) => [user.userId, user]));
    const deviceById = new Map(devices.map((device) => [device.userProductId, device]));

    return contextKeys.flatMap((key) => {
      const user = userById.get(key.userId);
      if (!user) return [];

      const device = key.userProductId ? deviceById.get(key.userProductId) : undefined;

      return [
        {
          user,
          contacts: contacts
            .filter((contact) => contact.userId === key.userId)
            .map(({ contactId, contactNumber }) => ({ contactId, contactNumber })),
          product: device ? toComposerProduct(device) : undefined,
          userProduct: device
            ? {
                userProductId: device.userProductId,
                serialNumber: device.serialNumber,
                loginPassword: device.loginPassword,
                additionalInfo: device.additionalInfo,
              }
            : undefined,
        },
      ];
    });
  },

  // ---------- Users ----------
  async getUserById(executor: DbExecutor, userId: string) {
    return executor
      .selectFrom('user_data')
      .select(composerUserColumns)
      .where('userId', '=', userId)
      .executeTakeFirst();
  },

  async getUserByEmail(executor: DbExecutor, email: string) {
    return executor
      .selectFrom('user_data')
      .select(composerUserColumns)
      .where('email', '=', email)
      .executeTakeFirst();
  },

  async roleExists(executor: DbExecutor, roleId: number): Promise<boolean> {
    const row = await executor
      .selectFrom('role')
      .select('roleId')
      .where('roleId', '=', roleId)
      .executeTakeFirst();
    return Boolean(row);
  },

  async createUser(executor: DbExecutor, data: ComposeCustomerInput) {
    return executor
      .insertInto('user_data')
      .values({
        userName: data.userName,
        roleId: data.roleId,
        email: data.email || null,
        address: data.address || null,
      })
      .returning(composerUserColumns)
      .executeTakeFirstOrThrow();
  },

  // ---------- Contacts ----------
  async getContactById(executor: DbExecutor, contactId: string) {
    return executor
      .selectFrom('contact')
      .select(['contactId', 'contactNumber', 'userId'])
      .where('contactId', '=', contactId)
      .executeTakeFirst();
  },

  async getContactByNumberForUser(executor: DbExecutor, userId: string, contactNumber: string) {
    return executor
      .selectFrom('contact')
      .select(['contactId', 'contactNumber'])
      .where('userId', '=', userId)
      .where('contactNumber', '=', contactNumber)
      .executeTakeFirst();
  },

  async createContact(executor: DbExecutor, userId: string, contactNumber: string) {
    return executor
      .insertInto('contact')
      .values({ userId, contactNumber })
      .returning(['contactId', 'contactNumber'])
      .executeTakeFirstOrThrow();
  },

  // ---------- Brands ----------
  async getBrandById(executor: DbExecutor, brandId: string) {
    return executor
      .selectFrom('brand')
      .select(['brandId', 'brandName'])
      .where('brandId', '=', brandId)
      .executeTakeFirst();
  },

  async getBrandByName(executor: DbExecutor, brandName: string) {
    return executor
      .selectFrom('brand')
      .select(['brandId', 'brandName'])
      .where('brandName', '=', brandName)
      .executeTakeFirst();
  },

  async createBrand(executor: DbExecutor, brandName: string) {
    return executor
      .insertInto('brand')
      .values({ brandName })
      .returning(['brandId', 'brandName'])
      .executeTakeFirstOrThrow();
  },

  // ---------- Product types ----------
  async getProductTypeById(executor: DbExecutor, productTypeId: string) {
    return executor
      .selectFrom('product_type')
      .select(['productTypeId', 'productTypeName'])
      .where('productTypeId', '=', productTypeId)
      .executeTakeFirst();
  },

  async getProductTypeByName(executor: DbExecutor, productTypeName: string) {
    return executor
      .selectFrom('product_type')
      .select(['productTypeId', 'productTypeName'])
      .where('productTypeName', '=', productTypeName)
      .executeTakeFirst();
  },

  async createProductType(executor: DbExecutor, productTypeName: string) {
    return executor
      .insertInto('product_type')
      .values({ productTypeName })
      .returning(['productTypeId', 'productTypeName'])
      .executeTakeFirstOrThrow();
  },

  // ---------- Products ----------
  async getProductById(executor: DbExecutor, productId: string): Promise<ComposerProduct | undefined> {
    const row = await productWithNames(executor).where('p.productId', '=', productId).executeTakeFirst();
    return row ? toComposerProduct(row) : undefined;
  },

  async getProductByUnique(
    executor: DbExecutor,
    productName: string,
    brandId: string,
    productTypeId: string
  ): Promise<ComposerProduct | undefined> {
    const row = await productWithNames(executor)
      .where('p.productName', '=', productName)
      .where('p.brandId', '=', brandId)
      .where('p.productTypeId', '=', productTypeId)
      .executeTakeFirst();
    return row ? toComposerProduct(row) : undefined;
  },

  async createProduct(
    executor: DbExecutor,
    product: ComposeProductInput,
    brandId: string,
    productTypeId: string
  ) {
    return executor
      .insertInto('product')
      .values({
        productName: product.productName,
        description: product.description || null,
        brandId,
        productTypeId,
      })
      .returning(['productId', 'productName', 'description'])
      .executeTakeFirstOrThrow();
  },

  // ---------- User products (devices) ----------
  async getUserProductById(executor: DbExecutor, userProductId: string) {
    return executor
      .selectFrom('user_product')
      .select(['userProductId', 'userId', 'productId', 'serialNumber', 'loginPassword', 'additionalInfo'])
      .where('userProductId', '=', userProductId)
      .executeTakeFirst();
  },

  async getUserProductBySerial(executor: DbExecutor, serialNumber: string) {
    return executor
      .selectFrom('user_product')
      .select(['userProductId', 'userId', 'productId', 'serialNumber', 'loginPassword', 'additionalInfo'])
      .where('serialNumber', '=', serialNumber)
      .executeTakeFirst();
  },

  async createUserProduct(
    executor: DbExecutor,
    userId: string,
    productId: string,
    data: ComposeUserProductInput
  ) {
    return executor
      .insertInto('user_product')
      .values({
        userId,
        productId,
        serialNumber: data.serialNumber,
        loginPassword: data.loginPassword || null,
        additionalInfo: data.additionalInfo || null,
      })
      .returning(['userProductId', 'userId', 'productId', 'serialNumber', 'loginPassword', 'additionalInfo'])
      .executeTakeFirstOrThrow();
  },

  // ---------- Service order ----------
  async createServiceOrder(
    executor: DbExecutor,
    userProductId: string,
    serviceOrder: ComposeServiceOrderInput
  ) {
    return executor
      .insertInto('service_order')
      .values({
        userProductId,
        estimatedPrice: serviceOrder.estimatedPrice ?? null,
        paymentMethod: null,
        priorityLevel: serviceOrder.priorityLevel,
        estimatedCompletionDate: serviceOrder.estimatedCompletionDate ?? null,
        issueDescription: serviceOrder.issueDescription,
        issueNotes: serviceOrder.issueNotes || null,
        entryBy: serviceOrder.entryByUserId,
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  },
};

export default serviceOrderComposerRepo;
