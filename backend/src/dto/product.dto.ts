export interface ProductQueryParams {
    product_id?: string;
    product_name?: string;
    brand_id?: string;
    product_type_id?: string;
    page?: number;
    limit?: number;
    offset?: number;
}

export interface CreateProduct {
    product_name: string;
    brand_id: string;
    product_type_id: string;
}

export interface UpdateOrDeleteProduct {
    product_name?: string;
    brand_id?: string;
    product_type_id?: string;
}

 