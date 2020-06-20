import axios from 'axios';

/**
 * User API service
 */
export default class UserService {
  constructor(key) {
    this.axios = axios.create();
    this.axios.defaults.headers = {
      Authorization: `UUID ${key}`,
    };
  }

  /**
   * Get current user object
   * @async
   */
  get() {
    return this.axios({
      url: `${API_HOST}/rest-auth/user/`,
      method: 'GET',
    })
      .then((response) => response.data);
  }
}
