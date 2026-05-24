/* eslint-disable no-unused-vars */
const Service = require('./Service');

/**
* Get service status history
* Retrieve all status updates for a service order (timeline)
*
* serviceOrderId UUID  (optional)
* statusId UUID  (optional)
* assignedTo UUID  (optional)
* notifyCustomer Boolean  (optional)
* page Integer  (optional)
* limit Integer  (optional)
* returns List
* */
const service_statusGET = ({ serviceOrderId, statusId, assignedTo, notifyCustomer, page, limit }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        serviceOrderId,
        statusId,
        assignedTo,
        notifyCustomer,
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
* Add status update to service order
* Create a status update in the service timeline
*
* createServiceStatuses CreateServiceStatuses 
* returns ServiceStatuses
* */
const service_statusPOST = ({ createServiceStatuses }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        createServiceStatuses,
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
* Delete status update
*
* serviceStatusId UUID 
* no response value expected for this operation
* */
const service_statusServiceStatusIdDELETE = ({ serviceStatusId }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        serviceStatusId,
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
* Get specific status update
*
* serviceStatusId UUID 
* returns ServiceStatuses
* */
const service_statusServiceStatusIdGET = ({ serviceStatusId }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        serviceStatusId,
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
* Update status comment
*
* serviceStatusId UUID 
* patchServiceStatuses PatchServiceStatuses 
* returns ServiceStatuses
* */
const service_statusServiceStatusIdPATCH = ({ serviceStatusId, patchServiceStatuses }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        serviceStatusId,
        patchServiceStatuses,
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
  service_statusGET,
  service_statusPOST,
  service_statusServiceStatusIdDELETE,
  service_statusServiceStatusIdGET,
  service_statusServiceStatusIdPATCH,
};
