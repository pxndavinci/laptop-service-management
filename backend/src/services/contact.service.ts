import { contactRepo } from '../repos/contact.repo';
import * as ContactModel from '../models/contact.model';

export const contactService = {
    async getContacts(params: ContactModel.ContactQueryParams) {
        params.page = params.page && params.page > 0 ? params.page : 1,
        params.limit = params.limit && params.limit > 0 ? params.limit : 10,
        params.offset = (params.page - 1) * params.limit;
        const [contacts, total]= await contactRepo.getContacts(params);
        return {
            contacts: contacts,
            total: total,
            page: params.page,
            limit: params.limit
        };
    },
    async createContact(data: ContactModel.CreateContact) {
        return await contactRepo.createContact(data);
    },
    async getContactByID(contactId: string){
        return await contactRepo.getContactByID(contactId);
    },
    async updateContact(contactId: string, data: ContactModel.PatchContact) {
        console.log("Update contact service called");
        const result = await contactRepo.updateContact(contactId, data)
        if (result === null) {
            return "No updates performed or contact not found";
        }
        return result;
    },
    async deleteContact(contactId: string) {
        return await contactRepo.deleteContact(contactId);
    }
}