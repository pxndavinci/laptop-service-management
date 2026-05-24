/**
 * The ServiceStatusController file is a very simple one, which does not need to be changed manually,
 * unless there's a case where business logic routes the request to an entity which is not
 * the service.
 * The heavy lifting of the Controller item is done in Request.js - that is where request
 * parameters are extracted and sent to the service, and where response is handled.
 */

const Controller = require('./Controller');
const service = require('../services/ServiceStatusService');
const service_statusGET = async (request, response) => {
  await Controller.handleRequest(request, response, service.service_statusGET);
};

const service_statusPOST = async (request, response) => {
  await Controller.handleRequest(request, response, service.service_statusPOST);
};

const service_statusServiceStatusIdDELETE = async (request, response) => {
  await Controller.handleRequest(request, response, service.service_statusServiceStatusIdDELETE);
};

const service_statusServiceStatusIdGET = async (request, response) => {
  await Controller.handleRequest(request, response, service.service_statusServiceStatusIdGET);
};

const service_statusServiceStatusIdPATCH = async (request, response) => {
  await Controller.handleRequest(request, response, service.service_statusServiceStatusIdPATCH);
};


module.exports = {
  service_statusGET,
  service_statusPOST,
  service_statusServiceStatusIdDELETE,
  service_statusServiceStatusIdGET,
  service_statusServiceStatusIdPATCH,
};
