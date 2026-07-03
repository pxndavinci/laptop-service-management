import db from '../db/index';
import * as ContactModel from '../models/contact.model';

export const contactRepo = {
    async getContacts(params: ContactModel.ContactQueryParams): Promise<[ContactModel.Contact[], number]> {
        let query = `SELECT 
            contact_id as "contactId",
            contact_number as "contactNumber",
            user_id as "userId",
            created_at as "createdAt",
            updated_at as "updatedAt"
         FROM contact WHERE 1=1`;
        let values: any[] = [];
        let idx: number = 1;

        if (params.contactNumber) {
            query += ` AND contact_number ILIKE $${idx}::text`;
            values.push(`%${params.contactNumber}%`);
            idx++;
        }

        if (params.userId !== undefined) {
            query += ` AND user_id = $${idx}::uuid`;
            values.push(params.userId);
            idx++;
        }

        query += ` LIMIT $${idx}::int`;
        values.push(params.limit);
        idx++;
        query += ` OFFSET $${idx}::int`;
        values.push(params.offset);
        idx++;

        const result = await db.query(query, values);
        return [result.rows as ContactModel.Contact[], result.rowCount ?? 0];
    },

    async createContact(params: ContactModel.CreateContact): Promise<ContactModel.Contact> {
        const query = `
            INSERT INTO contact (contact_number, user_id)
            VALUES ($1::text, $2::uuid)
            RETURNING *;
        `;
        const values = [params.contactNumber, params.userId];
        const result = await db.query(query, values);
        return result.rows[0] as ContactModel.Contact;
    },

    async getContactByID(contactId: string): Promise<ContactModel.Contact> {
        const query = `
            SELECT * FROM contact WHERE contact_id = $1::uuid;
        `;
        const result = await db.query(query, [contactId]);
        return result.rows[0] as ContactModel.Contact;
    },

    async updateContact(contactId: string, params: ContactModel.PatchContact): Promise<ContactModel.Contact | null> {
        let query = `UPDATE contact SET `;
        let values: any[] = [];
        let idx: number = 1;
        const updates: string[] = [];

        if (params.contactNumber !== undefined) {
            updates.push(`contact_number = $${idx}::text`);
            values.push(params.contactNumber);
            idx++;
        }

        if (params.userId !== undefined) {
            updates.push(`user_id = $${idx}::uuid`);
            values.push(params.userId);
            idx++;
        }

        if (updates.length === 0) {
            return null;
        }

        query += updates.join(', ') + ` WHERE contact_id = $${idx}::uuid RETURNING *;`;
        values.push(contactId);

        const result = await db.query(query, values);
        return result.rows[0] as ContactModel.Contact ?? null;
    },

    async deleteContact(contactId: string) {
        const query = `DELETE FROM contact WHERE contact_id = $1::uuid;`;
        return await db.query(query, [contactId]);
    },
};