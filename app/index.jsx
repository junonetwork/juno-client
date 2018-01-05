/* global document window */
/* eslint-disable global-require */
import React                  from 'react';
import { render }             from 'react-dom';
import { Provider }           from 'react-redux';
import {
  batchActions,
}                             from 'redux-batched-actions';
import store                  from './redux/store';
import App                    from './components/App';
import {
  addSheet,
}                             from './redux/modules/sheets';
import {
  addSearchCollectionTable,
}                             from './redux/modules/tables';
import {
  focusCell,
}                             from './redux/modules/focus';
import {
  formatSheetAddress,
  formatAddress,
}                             from './utils/cell';
import                             './style.scss';


if (process.env.NODE_ENV === 'development') {
  window.R = require('ramda');
}


// store.subscribe(() => console.log('store emit'));

store.dispatch(
  batchActions([
    addSheet(0, 30, 30),
    addSearchCollectionTable(
      '0',
      formatSheetAddress('0', 0, 0),
      formatAddress(0, 0),
      'Person',
      ['schema:name', 'schema:birthPlace', 'schema:birthDate', 'schema:sibling'],
      [0, 2, 3, 0, 2, 3]
    ),
    // focusCell('0', 0, 0),
  ])
);


render((
  <Provider store={store}>
    <App />
  </Provider>
), document.getElementById('app'));
