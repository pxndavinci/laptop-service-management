import { User } from './user.model';
import { Product } from './product.model';

export interface User_Product{
    user_product_id: string;
    user_id: User;
    product_id: Product;
    serial_number: number;
    login_password?: string;
    additional_info?: string;
    created_at: Date;
    updated_at: Date;
}