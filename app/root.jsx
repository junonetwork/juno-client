import React                  from 'react';
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
  generateTableId,
}                             from './utils/table';


// store.subscribe(() => console.log('store emit'));

store.dispatch(
  batchActions([
    addSheet('1', 30, 40),
    addSearchCollectionTable(
      '1',
      generateTableId('1', '0-0'),
      '0-0',
      'Person',
      ['skos:prefLabel', 'schema:name', 'schema:birthPlace', 'schema:birthDate', 'schema:sibling'],
      [0, 2, 3, 0]
    ),
  ])
);


export default () => (
  <Provider store={store}>
    <App />
  </Provider>
);