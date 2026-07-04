import { userProductRepo } from '../repos/user-product.repo';
import * as UserProduct from '../models/user-product.model';
import { NotFoundError } from '../middlewares/error.middleware';
import { paginate, requireAnyField } from '../lib/utils';

export const userProductService = {
  async getUserProducts(params: UserProduct.UserProductQueryParams) {
    const { page, limit, offset } = paginate(params.page, params.limit);
    const [data, total] = await userProductRepo.getUserProducts({ ...params, limit, offset });
    return { data, total, page, limit };
  },

  async getUserProductByID(userProductId: string) {
    const userProduct = await userProductRepo.getUserProductByID(userProductId);
    if (!userProduct) throw new NotFoundError('User product not found');
    return userProduct;
  },

  async createUserProduct(data: UserProduct.CreateUserProduct) {
    return userProductRepo.createUserProduct(data);
  },

  async updateUserProduct(userProductId: string, data: UserProduct.PatchUserProduct) {
    requireAnyField(data);
    const userProduct = await userProductRepo.updateUserProduct(userProductId, data);
    if (!userProduct) throw new NotFoundError('User product not found');
    return userProduct;
  },

  async deleteUserProduct(userProductId: string) {
    const deleted = await userProductRepo.deleteUserProduct(userProductId);
    if (!deleted) throw new NotFoundError('User product not found');
  },
};
