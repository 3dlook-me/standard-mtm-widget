import axios from 'axios';

import { flowStatuses } from '../configs/flowStatuses';

// initial flow state value
const globalInitialValue = {
  status: flowStatuses.CREATED,
};

let globalState = {
  ...globalInitialValue,
};

/**
 * Flow API service
 */
export default class FlowService {
  flowId = null;

  constructor(key) {
    this.key = key;
    this.axios = axios.create();
    this.axios.defaults.headers = {
      Authorization: `UUID ${key}`,
    };
  }

  /**
   * Reset cached global flow state
   */
  resetGlobalState() {
    globalState = {
      ...globalInitialValue,
    };
  }

  /**
   * Save flow id
   *
   * @param {string} flowId - flow id
   */
  setFlowId(flowId) {
    this.flowId = flowId;
  }

  /**
   * Create flow object
   * @async
   * @param {any} state - flow state
   */
  create(state) {
    globalState = {
      ...globalState,
      ...state,
    };

    return this.axios({
      url: `${API_HOST}/api/v2/persons/widget/`,
      method: 'POST',
      headers: {
        Authorization: `PUBLIC ${this.key}`,
      },
      data: {
        state: {
          ...globalState,
        },
      },
    })
      .then((response) => response.data);
  }

  /**
   * Get flow object details
   *
   * @param {string} flowId - flow object id
   */
  get(flowId = this.flowId) {
    return this.axios({
      url: `${API_HOST}/api/v2/persons/widget/${flowId}/`,
      method: 'GET',
    })
      .then((response) => {
        const { state } = response.data;

        globalState = {
          ...globalState,
          ...state,
        };

        return response.data;
      });
  }

  /**
   * Patch flow object details
   *
   * @param {Object} data - data object
   * @param {string} flowId - flow object id
   */
  update(data, flowId = this.flowId) {
    globalState = {
      ...globalState,
      ...data.state,
    };

    return this.axios({
      url: `${API_HOST}/api/v2/persons/widget/${flowId}/`,
      method: 'PATCH',
      data: {
        ...data,
        state: {
          ...globalState,
          ...data.state,
        },
      },
    })
      .then((response) => response.data);
  }

  /**
   * Patch flow state object details
   *
   * @param {Object} state - data object
   * @param {string} flowId - flow object id
   */
  updateState(state, flowId = this.flowId) {
    globalState = {
      ...globalState,
      ...state,
    };

    return this.axios({
      url: `${API_HOST}/api/v2/persons/widget/${flowId}/`,
      method: 'PATCH',
      data: {
        state: {
          ...globalState,
        },
      },
    })
      .then((response) => response.data);
  }

  /**
   * Deactivate widget
   *
   * @param {string} flowId - flow object id
   */
  widgetDeactivate(flowId = this.flowId) {
    return this.axios({
      url: `${API_HOST}/api/v2/persons/widget/${flowId}/deactivate/`,
      method: 'POST',
      data: {},
    })
      .then((response) => response.data);
  }

  /**
   * Update local state for interval patch state updates
   *
   * @param {Object} state - data object
   */
  updateLocalState(state) {
    globalState = {
      ...globalState,
      ...state,
    };
  }

  /**
   * Get custom settings
   */
  getCustomSettings() {
    return this.axios({
      url: `${API_HOST}/api/v2/users/widget_settings/`,
      method: 'GET',
      headers: {
        Authorization: `PUBLIC ${this.key}`,
      },
    })
      .then((response) => response.data)
      .catch((err) => console.error(err));
  }

  /**
   * Check if widget is allowed to be opened
   */
  isWidgetAllowed() {
    return this.axios({
      url: `${API_HOST}/api/v2/persons/widget/is_allowed/`,
      method: 'GET',
      headers: {
        Authorization: `PUBLIC ${this.key}`,
      },
    })
      .then(() => true)
      .catch(() => false);
  }

  /**
   * Set widgets page url to check in
   *
   * @param {string} url - widget installed page url
   */
  widgetCheckIn(url) {
    return this.axios({
      url: `${API_HOST}/api/v2/users/widget_check_in/`,
      method: 'POST',
      headers: {
        Authorization: `PUBLIC ${this.key}`,
      },
      data: {
        url,
      },
    })
      .catch((err) => console.error(err));
  }
}
