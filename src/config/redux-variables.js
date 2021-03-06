/**
 * @file Determines all the variables we will be needing for the redux store
 * The redux store promises to have only one implementation for action creators and action types
 * and reducers hence all the variables are being preset
 * All defined variables will come with a doc that represents what they do
 */

/**
 * Third Party Imports
 */
// NA

/**
 * Local Imports
 */
// NA

/**
 * @const - this will populate the redux store with the required actions
 * ****************************************
 * TO UPDATE THIS CONFIG VARIABLE
 * ****************************************
 * *** Key Represents the reference to the layer ***
 * *** Values could be an array or string that represents
 * all the sublayers required to be loaded
 */
export const reduxVariables = {
  LOAD_PROJECTS: "LOAD_PROJECTS",
  LOAD_PROJECT: "LOAD_PROJECT",
  POST_PROJECT: "POST_PROJECT",
  POST_COMPLETION_STAT: "POST_COMPLETION_STAT",
  APPROVE_POST: "APPROVE_POST",
  DECLINE_POST: "DECLINE_POST",
  USERS: "USERS",
  USER_INFO: "USER_INFO",
  SIGNUP: "SIGNUP",
  GET_USERS: 'GET_USERS',
  DELETE_USER: 'DELETE_USER',
  GET_CONTRACTORS: 'GET_CONTRACTORS',
  CREATE_CONTRACTORS: 'CREATE_CONTRACTORS'
};
