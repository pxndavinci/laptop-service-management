import db from '../db/index';
import * as Contact from '../models/contact.model';

export const contactRepo = {
  async getContacts(
    params: Contact.ContactQueryParams & { limit: number; offset: number }
  ): Promise<[Contact.Contact[], number]> {
    const filtered = db
      .selectFrom('contact')
      .$if(!!params.contactNumber, (qb) =>
        qb.where('contactNumber', 'like', `%${params.contactNumber}%`)
      )
      .$if(!!params.userId, (qb) => qb.where('userId', '=', params.userId!));

    const contacts = await filtered
      .selectAll()
      .orderBy('createdAt', 'desc')
      .limit(params.limit)
      .offset(params.offset)
      .execute();

    const { total } = await filtered
      .select((eb) => eb.fn.countAll<number>().as('total'))
      .executeTakeFirstOrThrow();

    return [contacts, total];
  },

  async getContactByID(contactId: string): Promise<Contact.Contact | undefined> {
    return db.selectFrom('contact').selectAll().where('contactId', '=', contactId).executeTakeFirst();
  },

  async createContact(data: Contact.CreateContact): Promise<Contact.Contact> {
    return db
      .insertInto('contact')
      .values({
        contactNumber: data.contactNumber,
        userId: data.userId,
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  },

  async updateContact(
    contactId: string,
    data: Contact.PatchContact
  ): Promise<Contact.Contact | undefined> {
    return db
      .updateTable('contact')
      .set({
        contactNumber: data.contactNumber,
        userId: data.userId,
      })
      .where('contactId', '=', contactId)
      .returningAll()
      .executeTakeFirst();
  },

  async deleteContact(contactId: string): Promise<boolean> {
    const result = await db
      .deleteFrom('contact')
      .where('contactId', '=', contactId)
      .executeTakeFirst();
    return result.numDeletedRows > 0n;
  },
};
