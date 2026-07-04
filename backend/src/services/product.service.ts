import { productRepo } from '../repos/product.repo';
import * as Product from '../models/product.model';
import { NotFoundError } from '../middlewares/error.middleware';
import { paginate, requireAnyField } from '../lib/utils';

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
    return productRepo.createProduct(data);
  },

  async updateProduct(productId: string, data: Product.PatchProduct) {
    requireAnyField(data);
    const product = await productRepo.updateProduct(productId, data);
    if (!product) throw new NotFoundError('Product not found');
    return product;
  },

  async deleteProduct(productId: string) {
    const deleted = await productRepo.deleteProduct(productId);
    if (!deleted) throw new NotFoundError('Product not found');
  },
};
