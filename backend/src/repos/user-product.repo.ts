import db from '../db/index';
import * as UserProduct from '../models/user-product.model';

const withNames = () =>
  db
    .selectFrom('user_product as up')
    .innerJoin('product as p', 'p.productId', 'up.productId')
    .innerJoin('brand as b', 'b.brandId', 'p.brandId')
    .innerJoin('product_type as pt', 'pt.productTypeId', 'p.productTypeId')
    .selectAll('up')
    .select(['p.productName', 'b.brandName', 'pt.productTypeName']);

export const userProductRepo = {
  async getUserProducts(
    params: UserProduct.UserProductQueryParams & { limit: number; offset: number }
  ): Promise<[UserProduct.UserProductWithNames[], number]> {
    const filtered = withNames()
      .$if(!!params.userId, (qb) => qb.where('up.userId', '=', params.userId!))
      .$if(!!params.productId, (qb) => qb.where('up.productId', '=', params.productId!))
      .$if(!!params.serialNumber, (qb) =>
        qb.where('up.serialNumber', 'ilike', `%${params.serialNumber}%`)
      );

    const userProducts = await filtered
      .orderBy('up.createdAt', 'desc')
      .limit(params.limit)
      .offset(params.offset)
      .execute();

    const { total } = await filtered
      .clearSelect()
      .select((eb) => eb.fn.countAll<number>().as('total'))
      .executeTakeFirstOrThrow();

    return [userProducts, total];
  },

  async getUserProductByID(
    userProductId: string
  ): Promise<UserProduct.UserProductWithNames | undefined> {
    return withNames().where('up.userProductId', '=', userProductId).executeTakeFirst();
  },

  async createUserProduct(data: UserProduct.CreateUserProduct): Promise<UserProduct.UserProduct> {
    return db
      .insertInto('user_product')
      .values({
        userId: data.userId,
        productId: data.productId,
        serialNumber: data.serialNumber,
        loginPassword: data.loginPassword ?? null,
        additionalInfo: data.additionalInfo ?? null,
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  },

  async updateUserProduct(
    userProductId: string,
    data: UserProduct.PatchUserProduct
  ): Promise<UserProduct.UserProduct | undefined> {
    return db
      .updateTable('user_product')
      .set({
        userId: data.userId,
        productId: data.productId,
        serialNumber: data.serialNumber,
        loginPassword: data.loginPassword,
        additionalInfo: data.additionalInfo,
      })
      .where('userProductId', '=', userProductId)
      .returningAll()
      .executeTakeFirst();
  },

  async deleteUserProduct(userProductId: string): Promise<boolean> {
    const result = await db
      .deleteFrom('user_product')
      .where('userProductId', '=', userProductId)
      .executeTakeFirst();
    return result.numDeletedRows > 0n;
  },
};
