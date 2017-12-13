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
// import {
//   createEpicMiddleware,
// }                             from 'redux-observable';
import reducer                from './reducer';
// import epic                   from './epic';


const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;


export default createStore(
  enableBatching(reducer),
  composeEnhancers(
    applyMiddleware(
      thunk
      // createEpicMiddleware(epic)
    ),
  )
);
