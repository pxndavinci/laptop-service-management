import db from '../db/index';
import * as Product from '../models/product.model';

const productWithNames = () =>
  db
    .selectFrom('product')
    .innerJoin('brand', 'brand.brandId', 'product.brandId')
    .innerJoin('product_type', 'product_type.productTypeId', 'product.productTypeId')
    .select([
      'product.productId',
      'product.productName',
      'product.description',
      'product.brandId',
      'product.productTypeId',
      'product.createdAt',
      'product.updatedAt',
      'brand.brandName',
      'product_type.productTypeName',
    ]);

export const productRepo = {
  async getProducts(
    params: Product.ProductQueryParams & { limit: number; offset: number }
  ): Promise<[Product.ProductWithNames[], number]> {
    const filtered = productWithNames()
      .$if(!!params.productName, (qb) =>
        qb.where('product.productName', 'ilike', `%${params.productName}%`)
      )
      .$if(!!params.brandId, (qb) => qb.where('product.brandId', '=', params.brandId!))
      .$if(!!params.productTypeId, (qb) =>
        qb.where('product.productTypeId', '=', params.productTypeId!)
      );

    const products = await filtered
      .orderBy('product.createdAt', 'desc')
      .limit(params.limit)
      .offset(params.offset)
      .execute();

    const { total } = await filtered
      .clearSelect()
      .select((eb) => eb.fn.countAll<number>().as('total'))
      .executeTakeFirstOrThrow();

    return [products, total];
  },

  async getProductByID(productId: string): Promise<Product.ProductWithNames | undefined> {
    return productWithNames().where('product.productId', '=', productId).executeTakeFirst();
  },

  async createProduct(data: Product.CreateProduct): Promise<Product.Product> {
    return db
      .insertInto('product')
      .values({
        productName: data.productName,
        description: data.description ?? null,
        brandId: data.brandId,
        productTypeId: data.productTypeId,
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  },

  async updateProduct(
    productId: string,
    data: Product.PatchProduct
  ): Promise<Product.Product | undefined> {
    return db
      .updateTable('product')
      .set({
        productName: data.productName,
        description: data.description,
        brandId: data.brandId,
        productTypeId: data.productTypeId,
      })
      .where('productId', '=', productId)
      .returningAll()
      .executeTakeFirst();
  },

  async deleteProduct(productId: string): Promise<boolean> {
    const result = await db
      .deleteFrom('product')
      .where('productId', '=', productId)
      .executeTakeFirst();
    return result.numDeletedRows > 0n;
  },
};
