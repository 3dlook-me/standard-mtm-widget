import { createStore } from 'redux';
import reducer, { INITIAL_STATE } from './reducers';

/* eslint no-underscore-dangle: off */
export default createStore(
  reducer,
  INITIAL_STATE,
  typeof __REDUX_DEVTOOLS_EXTENSION__ === 'function'
    ? global.__REDUX_DEVTOOLS_EXTENSION__()
    : undefined,
);
