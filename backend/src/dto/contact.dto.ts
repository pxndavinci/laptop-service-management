export interface ContactQueryParams {
    contact_id?: string;
    user_id?: string;
    contact_number?: string;
    page?: number;
    limit?: number;
    offset?: number;
}

export interface CreateContact {
    user_id: string;
    contact_number: string;
}

export interface UpdateOrDeleteContact {
    contact_number?: string;
    user_id?: string;
}