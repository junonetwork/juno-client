/* global document window */
/* eslint-disable global-require */
import React                  from 'react';
import { render }             from 'react-dom';
import { Provider }           from 'react-redux';
import {
  batchActions,
}                             from 'redux-batched-actions';
import store                  from './redux/store';
import App                    from './containers/AppContainer';
import {
  addSheet,
}                             from './redux/modules/sheets';
import {
  addSearchCollectionTable,
}                             from './redux/modules/tables';
import {
  makeCellActive,
}                             from './redux/modules/active';
import {
  formatAddress,
}                             from './utils/cell';
import {
  formatTableId,
}                             from './utils/table';
import                             './style.scss';


if (process.env.NODE_ENV === 'development') {
  window.R = require('ramda');
}


// store.subscribe(() => console.log('store emit'));

const sheetId = '0';

store.dispatch(
  batchActions([
    addSheet(sheetId, 40, 30),
    addSearchCollectionTable(
      sheetId,
      formatTableId(sheetId, 0, 0),
      formatAddress(sheetId, 0, 0),
      'Person',
      ['schema:name', 'schema:birthPlace', 'schema:birthDate', 'schema:sibling'],
      [{ from: 1, to: 3, }, 1, 3, 10]
    ),
    addSearchCollectionTable(
      sheetId,
      formatTableId(sheetId, 1, 10),
      formatAddress(sheetId, 1, 10),
      'Person',
      ['schema:name', 'schema:birthPlace'],
      [{ from: 0, to: 2, }]
    ),
    makeCellActive(sheetId, 0, 0),
    // second sheet
    addSheet('1', 40, 30),
    addSearchCollectionTable(
      '1',
      formatTableId('1', 0, 0),
      formatAddress('1', 0, 0),
      'Person',
      ['schema:name'],
      [{ from: 0, to: 1, }]
    ),
  ], 'INIT_SHEET')
);


render((
  <Provider store={store}>
    <App />
  </Provider>
), document.getElementById('app'));
