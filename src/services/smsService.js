import axios from 'axios';

/**
 * SMS API service
 */
export default class SMSService {
  flowId = null;

  constructor(key) {
    this.axios = axios.create();
    this.axios.defaults.headers = {
      Authorization: `APIKey ${key}`,
    };
  }

  /**
   * Send sms with link for mobile flow
   * @async
   * @param {string} phone - phone number
   * @param {string} link - mobile flow url
   */
  send(phone, link) {
    return this.axios({
      url: `${API_HOST}/api/v2/measurements/send-link/`,
      method: 'POST',
      data: {
        phone,
        link,
      },
    })
      .then(response => response.data);
  }
}
