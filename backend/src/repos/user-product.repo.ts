import db from '../db/index';
import * as UserProduct from '../models/user-product.model';

export const userProductRepo = {
  async getUserProducts(
    params: UserProduct.UserProductQueryParams & { limit: number; offset: number }
  ): Promise<[UserProduct.UserProduct[], number]> {
    const filtered = db
      .selectFrom('user_product')
      .$if(!!params.userId, (qb) => qb.where('userId', '=', params.userId!))
      .$if(!!params.productId, (qb) => qb.where('productId', '=', params.productId!))
      .$if(!!params.serialNumber, (qb) =>
        qb.where('serialNumber', 'ilike', `%${params.serialNumber}%`)
      );

    const userProducts = await filtered
      .selectAll()
      .orderBy('createdAt', 'desc')
      .limit(params.limit)
      .offset(params.offset)
      .execute();

    const { total } = await filtered
      .select((eb) => eb.fn.countAll<number>().as('total'))
      .executeTakeFirstOrThrow();

    return [userProducts, total];
  },

  async getUserProductByID(userProductId: string): Promise<UserProduct.UserProduct | undefined> {
    return db
      .selectFrom('user_product')
      .selectAll()
      .where('userProductId', '=', userProductId)
      .executeTakeFirst();
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
