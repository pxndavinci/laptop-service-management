import {Brand} from './brand.model';
import {Product_type} from './product_type.model';

export interface Product {
    product_id: string;
    product_name: string;
    brand_id: Brand;
    product_type_id: Product_type;
    created_at: Date;
    updated_at: Date;
}