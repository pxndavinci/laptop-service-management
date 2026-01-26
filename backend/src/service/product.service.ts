import {productRepo} from '../repo/product.repo';
import * as ProductDTO from '../dto/product.dto';

export const productService = {
    async getProducts(params: ProductDTO.ProductQueryParams) {
        params.page = params.page && params.page > 0 ? params.page : 1,
        params.limit = params.limit && params.limit > 0 ? params.limit : 10,
        params.offset = (params.page - 1) * params.limit;
        const [products, total]= await productRepo.getProducts(params);
        return {
            products: products,
            total: total,
            page: params.page,
            limit: params.limit
        };
    },
    async createProduct(data: ProductDTO.CreateProduct) {
        return await productRepo.createProduct(data);
    },
    async updateProduct(product_id: string, data: ProductDTO.UpdateOrDeleteProduct) {
        const result = await productRepo.updateProduct(product_id, data)
        if (result === null) {
            return "No updates performed or product not found";
        }
        return result;
    },
    async deleteProduct(product_id: string) {
        return await productRepo.deleteProduct(product_id);
    }
}