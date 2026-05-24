import { userProductRepo } from '../repos/user-product.repo';
import * as UserProductModel from '../models/user-product.model';

export const userProductService = {
  async getUserProducts(params: UserProductModel.UserProductQueryParams) {
    params.page = params.page && params.page > 0 ? params.page : 1;
    params.limit = params.limit && params.limit > 0 ? params.limit : 10;
    params.offset = (params.page - 1) * params.limit;
    const [products, total] = await userProductRepo.getUserProducts(params);
    return {
      products,
      total,
      page: params.page,
      limit: params.limit,
    };
  },

  async createUserProduct(data: UserProductModel.CreateUserProduct) {
    return await userProductRepo.createUserProduct(data);
  },

  async getUserProductByID(user_product_id: string) {
    return await userProductRepo.getUserProductByID(user_product_id);
  },

  async updateUserProduct(user_product_id: string, data: UserProductModel.PatchUserProduct) {
    const result = await userProductRepo.updateUserProduct(user_product_id, data);
    if (result === null) {
      return 'No updates performed or user product not found';
    }
    return result;
  },

  async deleteUserProduct(user_product_id: string) {
    return await userProductRepo.deleteUserProduct(user_product_id);
  },
};
