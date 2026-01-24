import express, { Router } from 'express';

const router: Router = express.Router();   

/* GET contacts listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a contact resource');
}); 

router.get('/:contact_id', function(req, res, next) {
  const contactId = req.params.contact_id;
    // Logic to get contact by ID
  res.send(`Contact details for ID: ${contactId}`);
});

router.put('/:contact_id', function(req, res, next) {
  const contactId = req.params.contact_id;
  // Logic to update contact by ID
  res.send(`Contact with ID: ${contactId} updated`);
});

router.delete('/:contact_id', function(req, res, next) {
  const contactId = req.params.contact_id;
  // Logic to delete contact by ID
  res.send(`Contact with ID: ${contactId} deleted`);
});

export default router;