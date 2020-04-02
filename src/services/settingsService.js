import axios from 'axios';

/**
 * Settings service
 */
export default class SettingsService {
  constructor(key) {
    this.axios = axios.create();
    this.axios.defaults.headers = {
      Authorization: `APIKey ${key}`,
    };
  }

  /**
   * Get settings object
   * @async
   */
  getSettings() {
    return this.axios({
      url: `${API_HOST}/api/v2/measurements/mtm-widget/`,
      method: 'GET',
    })
      .then(response => response.data.mtm_widget);
  }
}
