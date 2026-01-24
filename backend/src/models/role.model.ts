export interface Role {
    role_id: number;
    role_name: string;
    is_customer: boolean;
    is_business: boolean;
    is_servicer: boolean;
    created_at: Date;
    updated_at: Date;
}