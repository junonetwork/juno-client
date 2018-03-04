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


const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
export default createStore(
  enableBatching(reducer),
  composeEnhancers(
    applyMiddleware(thunk, actionStream(epics))
  )
);
