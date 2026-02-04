export interface ProductQueryParams {
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

export interface UserProductQueryParams{
    user_id?: string;
    product_id?: string;
    serial_number?: string;
    page?: number;
    limit?: number;
    offset?: number;
}

export interface CreateUserProduct{
    user_id: string;
    product_id: string;
    serial_number?: string;
    login_password?: string;
    additional_info?: string;
}

export interface UpdateOrDeleteUserProduct{
    user_id?: string;
    product_id?: string;
    serial_number?: string;
    login_password?: string;
    additional_info?: string;
}
 