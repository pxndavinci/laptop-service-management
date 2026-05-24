import express, { Router } from 'express';
import ContactController from '../controllers/contact.controller';

const router: Router = express.Router();

router.get('/', ContactController.getContacts);
router.post('/', ContactController.createContact);
router.get('/:contactId', ContactController.getContactById);
router.patch('/:contactId', ContactController.updateContact);
router.delete('/:contactId', ContactController.deleteContact);

export default router;
