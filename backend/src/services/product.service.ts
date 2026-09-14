import { productRepo } from '../repos/product.repo';
import * as Product from '../models/product.model';
import { ConflictError, NotFoundError } from '../middlewares/error.middleware';
import { paginate, requireAnyField } from '../lib/utils';
import { withUniqueMessages } from '../lib/db-errors';

const PRODUCT_UNIQUE = {
  product_product_name_brand_id_product_type_id_key:
    'A product with this name already exists for that brand and type',
};

export const productService = {
  async getProducts(params: Product.ProductQueryParams) {
    const { page, limit, offset } = paginate(params.page, params.limit);
    const [data, total] = await productRepo.getProducts({ ...params, limit, offset });
    return { data, total, page, limit };
  },

  async getProductByID(productId: string) {
    const product = await productRepo.getProductByID(productId);
    if (!product) throw new NotFoundError('Product not found');
    return product;
  },

  async createProduct(data: Product.CreateProduct) {
    return withUniqueMessages(PRODUCT_UNIQUE, () => productRepo.createProduct(data));
  },

  async updateProduct(productId: string, data: Product.PatchProduct) {
    requireAnyField(data);
    const product = await withUniqueMessages(PRODUCT_UNIQUE, () =>
      productRepo.updateProduct(productId, data)
    );
    if (!product) throw new NotFoundError('Product not found');
    return product;
  },

  /**
   * Refused while customers' devices reference the product: user_product has
   * no ON DELETE CASCADE to product, deliberately, so a catalogue clean-up can
   * never erase customers' devices and their service history.
   */
  async deleteProduct(productId: string) {
    const devices = await productRepo.countDevices(productId);
    if (devices > 0) {
      throw new ConflictError(
        `${devices} registered device${devices === 1 ? ' uses' : 's use'} this product, so it cannot be deleted`
      );
    }
    const deleted = await productRepo.deleteProduct(productId);
    if (!deleted) throw new NotFoundError('Product not found');
  },
};
