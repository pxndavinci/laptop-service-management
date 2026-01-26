import db from '../db/index';
import * as dto from '../dto/contact.dto';
import { Contact } from '../model/contact.model';

export const contactRepo = {
    async getContacts(params: dto.ContactQueryParams) : Promise<[Contact[], number]> {
        let query = `SELECT * FROM contact WHERE 1=1`;
        let values: any[] = [];
        let idx: number = 1;
        if (params.contact_id) {
            query += ` AND contact_id ILIKE $${idx}::guid`;
            values.push(`%${params.contact_id}%`);
            idx++;
        }
        if (params.contact_number) {
            query += ` AND contact_number ILIKE $${idx}::text`;
            values.push(`%${params.contact_number}%`);
            idx++;
        }
        if (params.user_id !== undefined) {
            query += ` AND user_id = $${idx}::guid`;
            values.push(params.user_id);
            idx++;
        }
        query += ` LIMIT $${idx}::int`;
        values.push(params.limit);
        idx++;
        query += ` OFFSET $${idx}::int`;
        values.push(params.offset);
        idx++;
        const result = (await db.query(query, values));
        return [result.rows as Contact[], result.rowCount ?? 0];
    },
    async createContact(params: dto.CreateContact) : Promise<Contact> {
        const query = `
            INSERT INTO contact (contact_number, user_id)
            VALUES ($1::text, $2::uuid)
            RETURNING *;
        `;
        const values = [
            params.contact_number,
            params.user_id,
        ];
        const result: Contact = (await db.query(query, values)).rows[0];
        return result;
    },
    async UpdateOrDeleteContact(contact_id: string, params: dto.UpdateOrDeleteContact) : Promise<Contact | null> {
        console.log("Update contact repo called");
        let query = `UPDATE contact SET `;
        let values: any[] = [];
        let idx: number = 1;
        const updates: string[] = [];

        if (params.contact_number !== undefined) {
            updates.push(`contact_number = $${idx}::text`);
            values.push(params.contact_number);
            idx++;
        }
        if (params.user_id !== undefined) {
            updates.push(`user_id = $${idx}::uuid`);
            values.push(params.user_id);
            idx++;
        }
        if (updates.length === 0) {
            return null;
        }
        query += updates.join(', ') + ` WHERE contact_id = $${idx}::uuid RETURNING *;`;
        values.push(contact_id);
        const result: Contact = (await db.query(query, values)).rows[0];
        return result ?? null;
    },
    async deleteContact(contact_id: string)  {
        let query = `DELETE FROM contact WHERE contact_id = $1::uuid;`;
        return await db.query(query, [contact_id]);
    }
};