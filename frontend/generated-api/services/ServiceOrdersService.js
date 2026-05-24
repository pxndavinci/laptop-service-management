/* eslint-disable no-unused-vars */
const Service = require('./Service');

/**
* Get all service orders
* Retrieve all service orders with optional filtering
*
* tagNo Integer Filter by tagNo (optional)
* userProductId UUID Filter by userProductId (optional)
* paymentMethod String Payment method used (optional)
* paymentStatus String Payment status (optional)
* priorityLevel Integer Priority level (1=highest, 5=lowest) (optional)
* estimatedCompletionDate Date  (optional)
* actualCompletionDate Date  (optional)
* issueDescription String  (optional)
* status String Filter by status (optional)
* entryBy UUID Filter by entered by service order person (optional)
* page Integer  (optional)
* limit Integer  (optional)
* returns _service_orders_get_200_response
* */
const service_ordersGET = ({ tagNo, userProductId, paymentMethod, paymentStatus, priorityLevel, estimatedCompletionDate, actualCompletionDate, issueDescription, status, entryBy, page, limit }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        tagNo,
        userProductId,
        paymentMethod,
        paymentStatus,
        priorityLevel,
        estimatedCompletionDate,
        actualCompletionDate,
        issueDescription,
        status,
        entryBy,
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
* Create service order
* Create a new service order
*
* createServiceOrder CreateServiceOrder 
* returns ServiceOrders
* */
const service_ordersPOST = ({ createServiceOrder }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        createServiceOrder,
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
* Delete service order
*
* serviceOrderId UUID 
* no response value expected for this operation
* */
const service_ordersServiceOrderIdDELETE = ({ serviceOrderId }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        serviceOrderId,
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
* Get service order by ID
*
* serviceOrderId UUID 
* returns ServiceOrders
* */
const service_ordersServiceOrderIdGET = ({ serviceOrderId }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        serviceOrderId,
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
* Update service order
*
* serviceOrderId UUID 
* returns ServiceOrders
* */
const service_ordersServiceOrderIdPATCH = ({ serviceOrderId }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        serviceOrderId,
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
  service_ordersGET,
  service_ordersPOST,
  service_ordersServiceOrderIdDELETE,
  service_ordersServiceOrderIdGET,
  service_ordersServiceOrderIdPATCH,
};
