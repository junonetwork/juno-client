/* global window */
/* eslint-disable no-underscore-dangle, global-require */
import {
  createStore,
  applyMiddleware,
  compose,
}                             from 'redux';
import thunk                  from 'redux-thunk';
import {
  enableBatching,
  batchActions,
}                             from 'redux-batched-actions';
import reducer                from './reducer';
import actionStream           from './actionStream';
import epics                  from './epics';
import {
  addSheet,
}                             from './modules/sheets';
import {
  addGraph,
}                             from './modules/graphs';
import {
  addSearchCollectionTable,
}                             from './modules/tables';
import {
  makeCellActive,
}                             from './modules/active';
import {
  formatAddress,
}                             from '../utils/cell';
import {
  generateTableId,
}                             from '../utils/table';


if (!window.store) {
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

  window.store = createStore(
    enableBatching(reducer),
    composeEnhancers(
      applyMiddleware(thunk, actionStream(epics))
    )
  );

  // window.store.subscribe(() => console.log('store emit'));

  const sheetId = '0';

  window.store.dispatch(
    batchActions([
      addSheet(sheetId, 40, 30),
      addSearchCollectionTable(
        sheetId,
        generateTableId(),
        formatAddress(sheetId, 0, 0),
        'Person',
        ['schema:name', 'schema:birthPlace', 'schema:birthDate', 'schema:sibling'],
        [{ from: 1, to: 3, }, 1, 3, 10]
      ),
      addSearchCollectionTable(
        sheetId,
        generateTableId(),
        formatAddress(sheetId, 1, 10),
        'Person',
        ['schema:name', 'schema:birthPlace'],
        [{ from: 0, to: 2, }]
      ),
      // second window
      // addGraph('1'),
      addSheet('1', 40, 30),
      addSearchCollectionTable(
        '1',
        generateTableId(),
        formatAddress('1', 0, 0),
        'Person',
        ['schema:name'],
        [{ from: 0, to: 1, }]
      ),
      makeCellActive(sheetId, 0, 0),
    ], 'INIT_SHEET')
  );
}

export default window.store;
