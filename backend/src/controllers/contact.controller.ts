import { Request, Response } from 'express';
import { contactService } from '../services/contact.service';
import * as ContactModel from '../models/contact.model';

const ContactController = {
  getContacts: async (req: Request, res: Response) => {
    const input: ContactModel.ContactQueryParams = {
      contactNumber: req.query.contactNumber as string | undefined,
      userId: req.query.userId as string | undefined,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
    };

    const result = await contactService.getContacts(input);
    return res.status(200).json(result);
  },

  createContact: async (req: Request, res: Response) => {
    const input: ContactModel.CreateContact = {
      contactNumber: req.body.contactNumber as string,
      userId: req.body.userId as string,
    };

    const result = await contactService.createContact(input);
    res.status(201).json(result);
  },

  getContactById: async (req: Request, res: Response) => {
    const contactId: string = req.params.contactId[0];
    const result = await contactService.getContactByID(contactId);
    res.status(200).json(result);
  },

  updateContact: async (req: Request, res: Response) => {
    const input: ContactModel.PatchContact = {
      contactNumber: req.body.contactNumber as string | undefined,
      userId: req.body.userId as string | undefined,
    };
    const contactId: string = req.params.contactId[0];
    const result = await contactService.updateContact(contactId, input);
    res.status(200).json(result);
  },

  deleteContact: async (req: Request, res: Response) => {
    const contactId: string = req.params.contactId[0];
    const result = await contactService.deleteContact(contactId);
    res.status(200).json(result);
  },
};

export default ContactController;
