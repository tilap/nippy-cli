// Api client generated on 9-6-2016 20h55

const ApiClient = require('nippy-api-client').Client;

module.exports = class BaseClient extends ApiClient {

  /**
   * Create a new access token for a user based on it email/password
   * @param data new data to post
   */
  async createAccessToken(data = {}) {
    const response = await super.post('/accounts/accesstokens', {}, data);
    return response.getUniqueData();
  }

  /**
   * Get the current user based on the access token
   */
  async getCurrentUser() {
    const response = await super.get('/accounts/accesstokens');
    return response.getUniqueData();
  }

  /**
   * Register a new account
   * @param data new data to post
   */
  async registerAccount(data = {}) {
    const response = await super.post('/accounts/register/', {}, data);
    return response.getUniqueData();
  }

  /**
   * Validate an account with account data in url
   * @param options filter items to get
   */
  async validateAccount(options = {}) {
    const response = await super.get('/accounts/register/', options);
    return response.getUniqueData();
  }

  /**
   * Request a new password email
   * @param options filter items to get
   */
  async requestNewPassword(options = {}) {
    const response = await super.get('/accounts/password/', options);
    return response.getData();
  }

  /**
   * Set a new password
   * @param data new data to patch
   */
  async setAccountNewPassword(data = {}) {
    const response = await super.patch('/accounts/password/', {}, data);
    return response.getUniqueData();
  }

  /**
   * Trigger a notification
   * @param data new data to post
   */
  async triggerNotification(data = {}) {
    const response = await super.post('/notifiers', {}, data);
    return response.getUniqueData();
  }

  /**
   * Create a new user
   * @param data new data to post
   */
  async createUser(data = {}) {
    const response = await super.post('/users', {}, data);
    return response.getUniqueData();
  }

  /**
   * Get user list
   * @param options filter items to get
   */
  async getUsers(options = {}) {
    const response = await super.get('/users', options);
    return response.getSuccess();
  }

  /**
   * Get a user ressource from its id
   * @param id
   */
  async getUserById(id) {
    const response = await super.get(`/users/${id}`);
    return response.getUniqueData();
  }

  /**
   * Update a list of user ressources
   * @param options filter items to patch
   * @param data new data to patch
   */
  async updateUsers(options = {}, data = {}) {
    const response = await super.patch('/users', options, data);
    return response.getData();
  }

  /**
   * Update an existing user ressource
   * @param id
   * @param data new data to patch
   */
  async updateUserById(id, data = {}) {
    const response = await super.patch(`/users/${id}`, {}, data);
    return response.getUniqueData();
  }

  /**
   * Delete many user ressources
   * @param options filter items to delete
   */
  async deleteUsers(options = {}) {
    const response = await super.delete('/users', options);
    return response.getData();
  }

  /**
   * Delete a user by its id
   * @param id
   */
  async deleteUserById(id) {
    const response = await super.delete(`/users/${id}`);
    return response.getUniqueData();
  }

  /**
   * Give main api information such as version, name, author, documentation links...
   */
  async getDocumentationMain() {
    const response = await super.get('/documentation');
    return response.getUniqueData();
  }

  /**
   * Give api available errors code, name, description
   */
  async getDocumentationErrors() {
    const response = await super.get('/documentation/errors');
    return response.getData();
  }

  /**
   * Provide full api documentation
   */
  async getDocumentationMethods() {
    const response = await super.get('/documentation/methods');
    return response.getData();
  }

};
