/* eslint-disable global-require */
import {
  createStore,
  applyMiddleware,
}                             from 'redux';
import thunk                  from 'redux-thunk';
import {
  enableBatching,
}                             from 'redux-batched-actions';
import reducer                from '../../app/redux/reducer';
import {
  addSheet, increaseSheetMaxColumn, increaseSheetMaxRow,
}                             from '../../app/redux/modules/sheets';
import {
  addSearchCollectionTable,
}                             from '../../app/redux/modules/tables';
import {
  focusCell,
}                             from '../../app/redux/modules/focus';
import {
  teaseCell,
}                             from '../../app/redux/modules/teaser';
import {
  addEnhancedCell,
}                             from '../../app/redux/modules/enhanced';
import {
  formatAddress,
}                             from '../../app/utils/cell';
import {
  formatTableId,
}                             from '../../app/utils/table';
import {
  runPerfTests,
}                             from './utils';
import {
  graphFragment,
}                             from './perf-data';


const initStore = () => {
  const store =  createStore(
    enableBatching(reducer),
    applyMiddleware(thunk)
  );

  const sheetId = '0';
  const tableId = formatTableId(sheetId, 0, 0);
  const collectionAddress = formatAddress(sheetId, 0, 0);

  store.dispatch(addSheet(0, 50, 500));
  store.dispatch(addSearchCollectionTable(
    sheetId,
    tableId,
    collectionAddress,
    'Person',
    ['schema:name', 'schema:birthPlace', 'schema:birthDate', 'schema:sibling', 'schema:sibling'],
    [0, 1, 2, 3, 0, 1, 0, 10]
  ));
  store.dispatch(focusCell(sheetId, 0, 0));

  return store;
};


runPerfTests([
  {
    title: 'Initial Select        ',
    pre: () => {
      const store = initStore();
      delete require.cache[require.resolve('../../app/redux/modules/sheets')];
      const { getSheetMatrix, } = require('../../app/redux/modules/sheets');

      return { state: store.getState(), getSheetMatrix, };
    },
    perf: ({ state, getSheetMatrix, }) => {
      getSheetMatrix(state, '0', graphFragment.json);
    },
  },
  {
    title: 'Reselect             ',
    pre: () => {
      const store = initStore();
      delete require.cache[require.resolve('../../app/redux/modules/sheets')];
      const { getSheetMatrix, } = require('../../app/redux/modules/sheets');

      getSheetMatrix(store.getState(), '0', graphFragment.json);

      return { state: store.getState(), getSheetMatrix, };
    },
    perf: ({ state, getSheetMatrix, }) => {
      getSheetMatrix(state, '0', graphFragment.json);
    },
  },
  // TODO
  // {
  //   title: 'Update Table',
  //   pre: () => {
  //     const store = initStore();
  //     delete require.cache[require.resolve('../../app/redux/modules/sheets')];
  //     const { getSheetMatrix, } = require('../../app/redux/modules/sheets');

  //     getSheetMatrix(store.getState(), '0', graphFragment.json);

  //     return { state: store.getState(), getSheetMatrix, };
  //   },
  //   perf: ({ state, getSheetMatrix, }) => {
  //     getSheetMatrix(state, '0', graphFragment.json);
  //   },
  // },
  {
    title: 'Update MaxColumn  ',
    pre: () => {
      const store = initStore();
      delete require.cache[require.resolve('../../app/redux/modules/sheets')];
      const { getSheetMatrix, } = require('../../app/redux/modules/sheets');

      getSheetMatrix(store.getState(), '0', graphFragment.json);

      store.dispatch(increaseSheetMaxColumn('0'));

      return { state: store.getState(), getSheetMatrix, };
    },
    perf: ({ state, getSheetMatrix, }) => {
      getSheetMatrix(state, '0', graphFragment.json);
    },
  },
  {
    title: 'Update MaxRow    ',
    pre: () => {
      const store = initStore();
      delete require.cache[require.resolve('../../app/redux/modules/sheets')];
      const { getSheetMatrix, } = require('../../app/redux/modules/sheets');

      getSheetMatrix(store.getState(), '0', graphFragment.json);

      store.dispatch(increaseSheetMaxRow('0'));

      return { state: store.getState(), getSheetMatrix, };
    },
    perf: ({ state, getSheetMatrix, }) => {
      getSheetMatrix(state, '0', graphFragment.json);
    },
  },
  {
    title: 'Update GraphFragment',
    pre: () => {
      const store = initStore();
      delete require.cache[require.resolve('../../app/redux/modules/sheets')];
      const { getSheetMatrix, } = require('../../app/redux/modules/sheets');

      getSheetMatrix(store.getState(), '0', graphFragment.json);

      return { state: store.getState(), getSheetMatrix, jsonGraph: { ...graphFragment.json, }, };
    },
    perf: ({ state, getSheetMatrix, jsonGraph, }) => {
      getSheetMatrix(state, '0', jsonGraph);
    },
  },
  {
    title: 'Update CellFocus    ',
    pre: () => {
      const store = initStore();
      delete require.cache[require.resolve('../../app/redux/modules/sheets')];
      const { getSheetMatrix, } = require('../../app/redux/modules/sheets');
      store.dispatch(focusCell('0', 0, 0));

      getSheetMatrix(store.getState(), '0', graphFragment.json);

      store.dispatch(focusCell('0', 1, 4));

      return { state: store.getState(), getSheetMatrix, };
    },
    perf: ({ state, getSheetMatrix, }) => {
      getSheetMatrix(state, '0', graphFragment.json);
    },
  },
  {
    title: 'Update CellTeaser   ',
    pre: () => {
      const store = initStore();
      delete require.cache[require.resolve('../../app/redux/modules/sheets')];
      const { getSheetMatrix, } = require('../../app/redux/modules/sheets');
      store.dispatch(teaseCell('0', 0, 0));

      getSheetMatrix(store.getState(), '0', graphFragment.json);

      store.dispatch(teaseCell('0', 1, 4));

      return { state: store.getState(), getSheetMatrix, };
    },
    perf: ({ state, getSheetMatrix, }) => {
      getSheetMatrix(state, '0', graphFragment.json);
    },
  },
  {
    title: 'Update CellEnhanced   ',
    pre: () => {
      const store = initStore();
      delete require.cache[require.resolve('../../app/redux/modules/sheets')];
      const { getSheetMatrix, } = require('../../app/redux/modules/sheets');

      getSheetMatrix(store.getState(), '0', graphFragment.json);

      store.dispatch(addEnhancedCell('0', 0, 0));

      return { state: store.getState(), getSheetMatrix, };
    },
    perf: ({ state, getSheetMatrix, }) => {
      getSheetMatrix(state, '0', graphFragment.json);
    },
  },
]);
