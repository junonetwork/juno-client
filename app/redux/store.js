/* global window */
/* eslint-disable no-underscore-dangle */
import {
  createStore,
  applyMiddleware,
  compose,
}                             from 'redux';
import thunk                  from 'redux-thunk';
import {
  enableBatching,
}                             from 'redux-batched-actions';
import reducer                from './reducer';
import actionStream           from './actionStream';
import epics                  from './epics';


const makeStore = () => {
  if ((process.env.NODE_ENV === 'development') && window.store) {
    return window.store;
  }

  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  const store = createStore(
    enableBatching(reducer),
    composeEnhancers(
      applyMiddleware(thunk, actionStream(epics))
    )
  );

  if (process.env.NODE_ENV === 'development') {
    window.store = store;
  }

  return store;
};

export default makeStore();
