import {User} from './user.model';

export interface Contact {
    contact_id: string;
    contact_number: string;
    user_id: User;
    created_at: Date;
    updated_at: Date;
}