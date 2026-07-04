import { Request, Response } from 'express';
import { contactService } from '../services/contact.service';
import * as Contact from '../models/contact.model';

const ContactController = {
  getContacts: async (req: Request, res: Response) => {
    const input: Contact.ContactQueryParams = {
      contactNumber: req.query.contactNumber as string | undefined,
      userId: req.query.userId as string | undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    };
    const result = await contactService.getContacts(input);
    res.status(200).json(result);
  },

  createContact: async (req: Request, res: Response) => {
    const input: Contact.CreateContact = {
      contactNumber: req.body.contactNumber,
      userId: req.body.userId,
    };
    const result = await contactService.createContact(input);
    res.status(201).json(result);
  },

  getContactById: async (req: Request, res: Response) => {
    const result = await contactService.getContactByID(req.params.contactId);
    res.status(200).json(result);
  },

  updateContact: async (req: Request, res: Response) => {
    const input: Contact.PatchContact = {
      contactNumber: req.body.contactNumber,
      userId: req.body.userId,
    };
    const result = await contactService.updateContact(req.params.contactId, input);
    res.status(200).json(result);
  },

  deleteContact: async (req: Request, res: Response) => {
    await contactService.deleteContact(req.params.contactId);
    res.status(204).send();
  },
};

export default ContactController;
