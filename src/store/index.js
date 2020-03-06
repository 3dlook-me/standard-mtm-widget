import { createStore } from 'redux';
import reducer, { INITIAL_STATE } from './reducers';
import { loadState, saveState, throttle } from '../helpers/utils';

const persistedState = loadState() || INITIAL_STATE;

/* eslint no-underscore-dangle: off */
export const store = createStore(
  reducer,
  persistedState,
  typeof __REDUX_DEVTOOLS_EXTENSION__ === 'function'
    ? global.__REDUX_DEVTOOLS_EXTENSION__()
    : undefined,
);

store.subscribe(throttle(() => {
  saveState({
    ...store.getState(),
  });
}, 300));
