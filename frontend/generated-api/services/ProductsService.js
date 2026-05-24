/* eslint-disable no-unused-vars */
const Service = require('./Service');

/**
* Get all Products
* Retrieve all Products with optional filtering
*
* productName String Filter by product name (optional)
* brandId UUID Filter by brand (optional)
* productTypeId UUID Filter by product type (optional)
* page Integer  (optional)
* limit Integer  (optional)
* returns _products_get_200_response
* */
const productsGET = ({ productName, brandId, productTypeId, page, limit }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        productName,
        brandId,
        productTypeId,
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
* Create product
*
* createProduct CreateProduct 
* returns Products
* */
const productsPOST = ({ createProduct }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        createProduct,
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
* Delete product
*
* productId UUID 
* no response value expected for this operation
* */
const productsProductIdDELETE = ({ productId }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        productId,
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
* Get product by ID
*
* productId UUID 
* returns Products
* */
const productsProductIdGET = ({ productId }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        productId,
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
* Update product
*
* productId UUID 
* patchProduct PatchProduct 
* returns Products
* */
const productsProductIdPATCH = ({ productId, patchProduct }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        productId,
        patchProduct,
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
* Get all user Products
* Retrieve user Products with optional filtering
*
* userId UUID Filter by user ID (optional)
* productId UUID Filter by product ID (optional)
* serialNumber String Filter by serial number (optional)
* page Integer  (optional)
* limit Integer  (optional)
* returns _user_products_get_200_response
* */
const user_productsGET = ({ userId, productId, serialNumber, page, limit }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        userId,
        productId,
        serialNumber,
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
* Create user product
*
* createUserProduct CreateUserProduct 
* returns UserProducts
* */
const user_productsPOST = ({ createUserProduct }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        createUserProduct,
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
* Delete user product
*
* userProductId UUID 
* no response value expected for this operation
* */
const user_productsUserProductIdDELETE = ({ userProductId }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        userProductId,
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
* Get user product by ID
*
* userProductId UUID 
* returns UserProducts
* */
const user_productsUserProductIdGET = ({ userProductId }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        userProductId,
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
* Update user product
*
* userProductId UUID 
* patchUserProduct PatchUserProduct 
* returns UserProducts
* */
const user_productsUserProductIdPATCH = ({ userProductId, patchUserProduct }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        userProductId,
        patchUserProduct,
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
