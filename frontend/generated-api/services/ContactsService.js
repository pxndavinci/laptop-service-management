/* eslint-disable no-unused-vars */
const Service = require('./Service');

/**
* Delete contact
*
* contactId UUID 
* no response value expected for this operation
* */
const contactsContactIdDELETE = ({ contactId }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        contactId,
      }));
    } catch (e) {
      reject(Service.rejectResponse(
        e.message || 'Invalid input',
        e.status || 405,
      ));
    }
  },
);
/**
* Get contact by ID
* Get contact by ID
*
* contactId UUID 
* returns Contacts
* */
const contactsContactIdGET = ({ contactId }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        contactId,
      }));
    } catch (e) {
      reject(Service.rejectResponse(
        e.message || 'Invalid input',
        e.status || 405,
      ));
    }
  },
);
/**
* Update contact
*
* contactId UUID 
* patchContact PatchContact 
* returns Contacts
* */
const contactsContactIdPATCH = ({ contactId, patchContact }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        contactId,
        patchContact,
      }));
    } catch (e) {
      reject(Service.rejectResponse(
        e.message || 'Invalid input',
        e.status || 405,
      ));
    }
  },
);
/**
* Get all contacts
* Retrieve all contacts with optional filtering
*
* contactNumber String Filter by contact number (optional)
* userId UUID Filter by user ID (optional)
* page Integer  (optional)
* limit Integer  (optional)
* returns _contacts_get_200_response
* */
const contactsGET = ({ contactNumber, userId, page, limit }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        contactNumber,
        userId,
        page,
        limit,
      }));
    } catch (e) {
      reject(Service.rejectResponse(
        e.message || 'Invalid input',
        e.status || 405,
      ));
    }
  },
);
/**
* Create contact
*
* createContact CreateContact 
* returns Contacts
* */
const contactsPOST = ({ createContact }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        createContact,
      }));
    } catch (e) {
      reject(Service.rejectResponse(
        e.message || 'Invalid input',
        e.status || 405,
      ));
    }
  },
);

module.exports = {
  contactsContactIdDELETE,
  contactsContactIdGET,
  contactsContactIdPATCH,
  contactsGET,
  contactsPOST,
};
