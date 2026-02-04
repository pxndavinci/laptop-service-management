import {contactRepo} from '../repo/contact.repo';
import * as ContactDTO from '../dto/contact.dto';

export const contactService = {
    async getContacts(params: ContactDTO.ContactQueryParams) {
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
    async createContact(data: ContactDTO.CreateContact) {
        return await contactRepo.createContact(data);
    },
    async getContactByID(contact_id: string){
        return await contactRepo.getContactByID(contact_id);
    },
    async updateContact(contact_id: string, data: ContactDTO.UpdateOrDeleteContact) {
        console.log("Update contact service called");
        const result = await contactRepo.updateContact(contact_id, data)
        if (result === null) {
            return "No updates performed or contact not found";
        }
        return result;
    },
    async deleteContact(contact_id: string) {
        return await contactRepo.deleteContact(contact_id);
    }
}