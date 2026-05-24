import { productRepo } from '../repos/product.repo';
import * as ProductModel from '../models/product.model';

export const productService = {
    async getProducts(params: ProductModel.ProductQueryParams) {
        params.page = params.page && params.page > 0 ? params.page : 1;
        params.limit = params.limit && params.limit > 0 ? params.limit : 10;
        params.offset = (params.page - 1) * params.limit;
        const [products, total] = await productRepo.getProducts(params);
        return {
            products,
            total,
            page: params.page,
            limit: params.limit,
        };
    },
    async createProduct(data: ProductModel.CreateProduct) {
        return await productRepo.createProduct(data);
    },
    async getProductByID(product_id: string) {
        return await productRepo.getProductByID(product_id);
    },
    async updateProduct(product_id: string, data: ProductModel.PatchProduct) {
        const result = await productRepo.updateProduct(product_id, data);
        if (result === null) {
            return 'No updates performed or product not found';
        }
        return result;
    },
    async deleteProduct(product_id: string) {
        return await productRepo.deleteProduct(product_id);
    },
};
