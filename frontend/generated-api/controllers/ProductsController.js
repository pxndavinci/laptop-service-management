/**
 * The ProductsController file is a very simple one, which does not need to be changed manually,
 * unless there's a case where business logic routes the request to an entity which is not
 * the service.
 * The heavy lifting of the Controller item is done in Request.js - that is where request
 * parameters are extracted and sent to the service, and where response is handled.
 */

const Controller = require('./Controller');
const service = require('../services/ProductsService');
const productsGET = async (request, response) => {
  await Controller.handleRequest(request, response, service.productsGET);
};

const productsPOST = async (request, response) => {
  await Controller.handleRequest(request, response, service.productsPOST);
};

const productsProductIdDELETE = async (request, response) => {
  await Controller.handleRequest(request, response, service.productsProductIdDELETE);
};

const productsProductIdGET = async (request, response) => {
  await Controller.handleRequest(request, response, service.productsProductIdGET);
};

const productsProductIdPATCH = async (request, response) => {
  await Controller.handleRequest(request, response, service.productsProductIdPATCH);
};

const user_productsGET = async (request, response) => {
  await Controller.handleRequest(request, response, service.user_productsGET);
};

const user_productsPOST = async (request, response) => {
  await Controller.handleRequest(request, response, service.user_productsPOST);
};

const user_productsUserProductIdDELETE = async (request, response) => {
  await Controller.handleRequest(request, response, service.user_productsUserProductIdDELETE);
};

const user_productsUserProductIdGET = async (request, response) => {
  await Controller.handleRequest(request, response, service.user_productsUserProductIdGET);
};

const user_productsUserProductIdPATCH = async (request, response) => {
  await Controller.handleRequest(request, response, service.user_productsUserProductIdPATCH);
};


module.exports = {
  productsGET,
  productsPOST,
  productsProductIdDELETE,
  productsProductIdGET,
  productsProductIdPATCH,
  user_productsGET,
  user_productsPOST,
  user_productsUserProductIdDELETE,
  user_productsUserProductIdGET,
  user_productsUserProductIdPATCH,
};
