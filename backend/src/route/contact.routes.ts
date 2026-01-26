import express, { Router } from 'express';
import { contactService } from '../service/contact.service';
import * as ContactDTO from '../dto/contact.dto';

const router: Router = express.Router();

router.get('/', async (req, res, next)  => {    
  const input: ContactDTO.ContactQueryParams = {
    contact_id: req.query.contact_id as string | undefined,
    contact_number: req.query.contact_number as string | undefined,
    user_id: req.query.user_id as string | undefined,
    page: req.query.page ? parseInt(req.query.page as string) : undefined,
    limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
    offset: undefined,
  }
  const result = await contactService.getContacts(input);
  res.json(result);
});

router.post('/', async (req, res, next) => {
  const input: ContactDTO.CreateContact = {
    contact_number: req.body.contact_number as string,
    user_id: req.body.user_id as string
  };
  const result = await contactService.createContact(input);
  res.status(201).json(result);
});

router.patch('/:contact_id', async (req, res, next) => {
  console.log("Patch contact request received");
  const input: ContactDTO.UpdateOrDeleteContact = {
    contact_number: req.body.contact_number as string | undefined,
    user_id: req.body.user_id as string | undefined,
  };
  const contact_id: string = req.params.contact_id;
  const result = await contactService.UpdateOrDeleteContact(contact_id, input);
  res.status(200).json(result);
});

router.delete('/:contact_id', async (req, res, next) => {
  const contactId: string = req.params.contact_id;
  const result = await contactService.deleteContact(contactId);
  res.status(200).json(result);
});

export default router;
