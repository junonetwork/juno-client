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
  addGraph,
}                             from './redux/modules/graphs';
import {
  addSearchCollectionTable,
}                             from './redux/modules/tables';
import {
  setFocus,
  searchInputId,
}                             from './redux/modules/focus';
import {
  formatAddress,
}                             from './utils/cell';
import {
  generateTableId,
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
      generateTableId(),
      formatAddress(sheetId, 0, 0),
      { repository: 'memory', type: 'schema:Person', },
      ['schema:name', 'schema:birthPlace', 'schema:birthDate', 'schema:sibling'],
      [{ from: 1, to: 3, }, 1, 3, 10]
    ),
    addSearchCollectionTable(
      sheetId,
      generateTableId(),
      formatAddress(sheetId, 1, 10),
      { repository: 'memory', type: 'schema:Person', },
      ['schema:name', 'schema:birthPlace'],
      [{ from: 0, to: 2, }]
    ),
    // second window
    addGraph('1'),
    /* addSheet('1', 40, 30),
     * addSearchCollectionTable(
     *   '1',
     *   generateTableId(),
     *   formatAddress('1', 0, 0),
     *   { repository: 'memory', type: 'schema:Person', },
     *   ['schema:name'],
     *   [{ from: 0, to: 1, }]
     * ),
     */
    setFocus(searchInputId('0', 0, 0)),
  ], 'INIT_SHEET')
);


render((
  <Provider store={store}>
    <App />
  </Provider>
), document.getElementById('app'));
