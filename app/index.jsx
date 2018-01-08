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
const tableId = formatTableId(sheetId, 0, 0);
const collectionAddress = formatAddress(sheetId, 0, 0);

store.dispatch(
  batchActions([
    addSheet(sheetId, 30, 50),
    addSearchCollectionTable(
      sheetId,
      tableId,
      collectionAddress,
      'Person',
      ['schema:name', 'schema:birthPlace', 'schema:birthDate', 'schema:sibling', 'schema:sibling'],
      [0, 1, 2, 3, 0, 1, 0, 10]
    ),
    // focusCell(sheetId, 0, 0),
  ])
);

// TODO - setting focus while page is still rendering doesn't work
setTimeout(() => store.dispatch(focusCell(sheetId, 0, 0)), 100);


render((
  <Provider store={store}>
    <App />
  </Provider>
), document.getElementById('app'));
