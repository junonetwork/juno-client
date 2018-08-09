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
  getSheetPathSets,
}                             from './redux/modules/sheets';
import {
  addGraph,
  getGraphPathSets,
}                             from './redux/modules/graphs';
import {
  addSearchCollectionTable,
  addValueCollectionTable,
  createSearchDescriptor,
}                             from './redux/modules/tables';
import {
  setFocus,
  cellId,
}                             from './redux/modules/focus';
import {
  createSheetComponent,
}                             from './utils/sheet';
import {
  createGraphComponent,
}                             from './utils/graph';
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
    addSheet(sheetId, 20, 30),
    addSearchCollectionTable(
      sheetId,
      generateTableId(),
      formatAddress(sheetId, 0, 0),
      createSearchDescriptor('memory', 'schema:Person', 'Person'),
      ['schema:name', 'schema:birthPlace', 'schema:birthDate', 'schema:sibling'],
      [{ from: 0, to: 2 }],
      'memory',
      'schema:Person'
    ),
    /* addValueCollectionTable(
     *   sheetId,
     *   generateTableId(),
     *   formatAddress(sheetId, 1, 10),
     *   ['resource', 'data:james', 'schema:name'],
     *   [],
     *   [{ from: 0, to: 3 }],
     *   'memory',
     *   'schema:Person'
     * ), */
    /* addValueCollectionTable(
     *   sheetId,
     *   generateTableId(),
     *   formatAddress(sheetId, 5, 10),
     *   ['resource', 'data:micah', 'schema:sibling'],
     *   ['skos:prefLabel', 'schema:birthPlace'],
     *   [{ from: 0, to: 3 }],
     *   'memory',
     *   'schema:Person'
     * ), */
    // second window
    /* addGraph('1'), */
    /* addSheet('1', 40, 30),
     * addSearchCollectionTable(
     *   '1',
     *   generateTableId(),
     *   formatAddress('1', 0, 0),
     *   { repository: 'memory', type: 'schema:Person', typeLabel: 'Person' },
     *   ['skos:prefLabel'],
     *   [{ from: 0, to: 1, }],
     *   'memory',
     *   'schema:Person'
     * ),
     */
    setFocus(cellId('0', 0, 0)),
  ], 'INIT_SHEET')
);


render((
  <Provider store={store}>
    <App>
      {{
         sheet: {
           getPathSets: getSheetPathSets,
           createElement: createSheetComponent,
         },
         graph: {
           getPathSets: getGraphPathSets,
           createElement: createGraphComponent,
         },
      }}
    </App>
  </Provider>
), document.getElementById('app'));
