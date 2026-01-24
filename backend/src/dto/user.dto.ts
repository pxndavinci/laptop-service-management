export interface UserQueryParams {
    user_id?: string;
    user_name?: string;
    email?:string;
    role_id?: number;
    page?: number;
    limit?: number;
    offset?: number;
}

export interface CreateUser {
    user_name: string;
    email: string;
    address: string;
    role_id: number;
}

export interface UpdateOrDeleteUser {
    user_name?: string;
    email?: string;
    address?: string;
    role_id?: number;
}
