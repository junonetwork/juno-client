/* global window */
/* eslint-disable no-underscore-dangle */
import {
  createStore,
  applyMiddleware,
  compose,
}                             from 'redux';
import {
  createEpicMiddleware,
}                             from 'redux-observable';
import reducer                from './reducer';
import epic                   from './epic';


const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;


export default createStore(
  reducer,
  composeEnhancers(
    applyMiddleware(
      createEpicMiddleware(epic)
    ),
  )
);
