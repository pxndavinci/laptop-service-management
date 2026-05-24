/**
 * The ContactsController file is a very simple one, which does not need to be changed manually,
 * unless there's a case where business logic routes the request to an entity which is not
 * the service.
 * The heavy lifting of the Controller item is done in Request.js - that is where request
 * parameters are extracted and sent to the service, and where response is handled.
 */

const Controller = require('./Controller');
const service = require('../services/ContactsService');
const contactsContactIdDELETE = async (request, response) => {
  await Controller.handleRequest(request, response, service.contactsContactIdDELETE);
};

const contactsContactIdGET = async (request, response) => {
  await Controller.handleRequest(request, response, service.contactsContactIdGET);
};

const contactsContactIdPATCH = async (request, response) => {
  await Controller.handleRequest(request, response, service.contactsContactIdPATCH);
};

const contactsGET = async (request, response) => {
  await Controller.handleRequest(request, response, service.contactsGET);
};

const contactsPOST = async (request, response) => {
  await Controller.handleRequest(request, response, service.contactsPOST);
};


module.exports = {
  contactsContactIdDELETE,
  contactsContactIdGET,
  contactsContactIdPATCH,
  contactsGET,
  contactsPOST,
};
