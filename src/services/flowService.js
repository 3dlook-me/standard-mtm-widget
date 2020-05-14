import axios from 'axios';

// initial flow state value
const globalInitialValue = {
  status: 'created',
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
    this.axios = axios.create();
    this.axios.defaults.headers = {
      Authorization: `APIKey ${key}`,
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
      data: {
        state: {
          ...globalState,
        },
      },
    })
      .then((response) => {
        this.flowId = response.data.uuid;
        return this.flowId;
      });
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
}
