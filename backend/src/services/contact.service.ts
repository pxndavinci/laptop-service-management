import { contactRepo } from '../repos/contact.repo';
import * as Contact from '../models/contact.model';
import { NotFoundError } from '../middlewares/error.middleware';
import { paginate, requireAnyField } from '../lib/utils';

export const contactService = {
  async getContacts(params: Contact.ContactQueryParams) {
    const { page, limit, offset } = paginate(params.page, params.limit);
    const [data, total] = await contactRepo.getContacts({ ...params, limit, offset });
    return { data, total, page, limit };
  },

  async getContactByID(contactId: string) {
    const contact = await contactRepo.getContactByID(contactId);
    if (!contact) throw new NotFoundError('Contact not found');
    return contact;
  },

  async createContact(data: Contact.CreateContact) {
    return contactRepo.createContact(data);
  },

  async updateContact(contactId: string, data: Contact.PatchContact) {
    requireAnyField(data);
    const contact = await contactRepo.updateContact(contactId, data);
    if (!contact) throw new NotFoundError('Contact not found');
    return contact;
  },

  async deleteContact(contactId: string) {
    const deleted = await contactRepo.deleteContact(contactId);
    if (!deleted) throw new NotFoundError('Contact not found');
  },
};
