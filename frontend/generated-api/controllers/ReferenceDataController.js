/**
 * The ReferenceDataController file is a very simple one, which does not need to be changed manually,
 * unless there's a case where business logic routes the request to an entity which is not
 * the service.
 * The heavy lifting of the Controller item is done in Request.js - that is where request
 * parameters are extracted and sent to the service, and where response is handled.
 */

const Controller = require('./Controller');
const service = require('../services/ReferenceDataService');
const referencesBrandsBrandIdDELETE = async (request, response) => {
  await Controller.handleRequest(request, response, service.referencesBrandsBrandIdDELETE);
};

const referencesBrandsBrandIdPATCH = async (request, response) => {
  await Controller.handleRequest(request, response, service.referencesBrandsBrandIdPATCH);
};

const referencesBrandsGET = async (request, response) => {
  await Controller.handleRequest(request, response, service.referencesBrandsGET);
};

const referencesBrandsPOST = async (request, response) => {
  await Controller.handleRequest(request, response, service.referencesBrandsPOST);
};

const referencesProductTypesGET = async (request, response) => {
  await Controller.handleRequest(request, response, service.referencesProductTypesGET);
};

const referencesProductTypesPOST = async (request, response) => {
  await Controller.handleRequest(request, response, service.referencesProductTypesPOST);
};

const referencesProductTypesProductTypeIdDELETE = async (request, response) => {
  await Controller.handleRequest(request, response, service.referencesProductTypesProductTypeIdDELETE);
};

const referencesProductTypesProductTypeIdPATCH = async (request, response) => {
  await Controller.handleRequest(request, response, service.referencesProductTypesProductTypeIdPATCH);
};

const referencesRolesGET = async (request, response) => {
  await Controller.handleRequest(request, response, service.referencesRolesGET);
};

const referencesRolesPOST = async (request, response) => {
  await Controller.handleRequest(request, response, service.referencesRolesPOST);
};

const referencesRolesRoleIdDELETE = async (request, response) => {
  await Controller.handleRequest(request, response, service.referencesRolesRoleIdDELETE);
};

const referencesRolesRoleIdPATCH = async (request, response) => {
  await Controller.handleRequest(request, response, service.referencesRolesRoleIdPATCH);
};

const referencesStatusesGET = async (request, response) => {
  await Controller.handleRequest(request, response, service.referencesStatusesGET);
};

const referencesStatusesPOST = async (request, response) => {
  await Controller.handleRequest(request, response, service.referencesStatusesPOST);
};

const referencesStatusesStatusIdDELETE = async (request, response) => {
  await Controller.handleRequest(request, response, service.referencesStatusesStatusIdDELETE);
};

const referencesStatusesStatusIdPATCH = async (request, response) => {
  await Controller.handleRequest(request, response, service.referencesStatusesStatusIdPATCH);
};


module.exports = {
  referencesBrandsBrandIdDELETE,
  referencesBrandsBrandIdPATCH,
  referencesBrandsGET,
  referencesBrandsPOST,
  referencesProductTypesGET,
  referencesProductTypesPOST,
  referencesProductTypesProductTypeIdDELETE,
  referencesProductTypesProductTypeIdPATCH,
  referencesRolesGET,
  referencesRolesPOST,
  referencesRolesRoleIdDELETE,
  referencesRolesRoleIdPATCH,
  referencesStatusesGET,
  referencesStatusesPOST,
  referencesStatusesStatusIdDELETE,
  referencesStatusesStatusIdPATCH,
};
