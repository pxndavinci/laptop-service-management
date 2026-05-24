/* eslint-disable no-unused-vars */
const Service = require('./Service');

/**
* Get all users
* Retrieve all users with optional filtering and pagination
*
* userName String Search by username (optional)
* email String Search by email (optional)
* roleId Integer Filter by role ID (optional)
* page Integer  (optional)
* limit Integer  (optional)
* returns _users_get_200_response
* */
const usersGET = ({ userName, email, roleId, page, limit }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        userName,
        email,
        roleId,
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
* Create a new user
* Add a new user to the system
*
* createUser CreateUser 
* returns Users
* */
const usersPOST = ({ createUser }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        createUser,
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
* Delete user
* Remove a user from the system
*
* userId UUID 
* no response value expected for this operation
* */
const usersUserIdDELETE = ({ userId }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        userId,
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
* Get user by ID
* Get user by ID
*
* userId UUID 
* returns Users
* */
const usersUserIdGET = ({ userId }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        userId,
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
* Update user
* Update user details
*
* userId UUID 
* patchUser PatchUser 
* returns Users
* */
const usersUserIdPATCH = ({ userId, patchUser }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        userId,
        patchUser,
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
  usersGET,
  usersPOST,
  usersUserIdDELETE,
  usersUserIdGET,
  usersUserIdPATCH,
};
