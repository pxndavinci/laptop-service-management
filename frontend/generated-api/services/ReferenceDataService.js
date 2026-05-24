/* eslint-disable no-unused-vars */
const Service = require('./Service');

/**
* Delete brand
*
* brandId UUID 
* no response value expected for this operation
* */
const referencesBrandsBrandIdDELETE = ({ brandId }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        brandId,
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
* Update brand
*
* brandId UUID 
* createBrand CreateBrand 
* returns Brands
* */
const referencesBrandsBrandIdPATCH = ({ brandId, createBrand }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        brandId,
        createBrand,
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
* Get all brands
*
* returns List
* */
const referencesBrandsGET = () => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
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
* Create brand
*
* createBrand CreateBrand 
* returns Brands
* */
const referencesBrandsPOST = ({ createBrand }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        createBrand,
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
* Get all product types
*
* returns List
* */
const referencesProductTypesGET = () => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
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
* Create product type
*
* createProductType CreateProductType 
* returns ProductTypes
* */
const referencesProductTypesPOST = ({ createProductType }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        createProductType,
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
* Delete product type
*
* productTypeId UUID 
* no response value expected for this operation
* */
const referencesProductTypesProductTypeIdDELETE = ({ productTypeId }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        productTypeId,
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
* Update product type
*
* productTypeId UUID 
* createProductType CreateProductType 
* returns ProductTypes
* */
const referencesProductTypesProductTypeIdPATCH = ({ productTypeId, createProductType }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        productTypeId,
        createProductType,
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
* Get all roles
*
* returns List
* */
const referencesRolesGET = () => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
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
* Create role
*
* createRole CreateRole 
* returns Roles
* */
const referencesRolesPOST = ({ createRole }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        createRole,
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
* Delete role
*
* roleId UUID 
* no response value expected for this operation
* */
const referencesRolesRoleIdDELETE = ({ roleId }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        roleId,
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
* Update role
*
* patchRole PatchRole 
* returns Roles
* */
const referencesRolesRoleIdPATCH = ({ patchRole }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        patchRole,
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
* Get all statuses
*
* returns List
* */
const referencesStatusesGET = () => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
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
* Create status
*
* createStatus CreateStatus 
* returns Statuses
* */
const referencesStatusesPOST = ({ createStatus }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        createStatus,
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
* Delete status
*
* statusId UUID 
* no response value expected for this operation
* */
const referencesStatusesStatusIdDELETE = ({ statusId }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        statusId,
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
* Update status
*
* statusId UUID 
* createStatus CreateStatus 
* returns Statuses
* */
const referencesStatusesStatusIdPATCH = ({ statusId, createStatus }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        statusId,
        createStatus,
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
