import { Role } from "./role.model";

export interface User {
    user_id: number;
    user_name: string;
    email: string;
    address: string;
    role_id: Role;
    created_at: Date;
    updated_at: Date;
}