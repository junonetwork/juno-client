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
  addSheet,
  increaseSheetMaxColumn,
  increaseSheetMaxRow,
}                             from '../../app/redux/modules/sheets';
import {
  addSearchCollectionTable,
}                             from '../../app/redux/modules/tables';
import {
  setFocus,
}                             from '../../app/redux/modules/focus';
import {
  teaseCell,
}                             from '../../app/redux/modules/teaser';
import {
  addEnhancedCell,
}                             from '../../app/redux/modules/enhanced';
import {
  setCellInput,
}                             from '../../app/redux/modules/cellInput';
import {
  formatAddress,
}                             from '../../app/utils/cell';
import {
  generateTableId,
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
  const tableId = generateTableId();
  const collectionAddress = formatAddress(sheetId, 0, 0);

  store.dispatch(addSheet(0, 50, 500));
  store.dispatch(addSearchCollectionTable(
    sheetId,
    tableId,
    collectionAddress,
    'Person',
    ['skos:prefLabel', 'schema:birthPlace', 'schema:birthDate', 'schema:sibling', 'schema:sibling'],
    [0, 1, 2, 3, 0, 1, 0, 10]
  ));
  store.dispatch(setFocus({ sheetId, column: 0, row: 0, }));

  return store;
};


runPerfTests([
  {
    title: 'Initial Select        ',
    init: () => {
      const store = initStore();
      delete require.cache[require.resolve('../../app/redux/modules/sheets')];
      const { getSheetMatrix, } = require('../../app/redux/modules/sheets');

      return { state: store.getState(), getSheetMatrix, };
    },
    run: ({ state, getSheetMatrix, }) => {
      getSheetMatrix(state, '0', graphFragment.json);
    },
  },
  {
    title: 'Reselect             ',
    init: () => {
      const store = initStore();
      delete require.cache[require.resolve('../../app/redux/modules/sheets')];
      const { getSheetMatrix, } = require('../../app/redux/modules/sheets');

      getSheetMatrix(store.getState(), '0', graphFragment.json);

      return { state: store.getState(), getSheetMatrix, };
    },
    run: ({ state, getSheetMatrix, }) => {
      getSheetMatrix(state, '0', graphFragment.json);
    },
  },
  // TODO
  // {
  //   title: 'Update Table',
  //   init: () => {
  //     const store = initStore();
  //     delete require.cache[require.resolve('../../app/redux/modules/sheets')];
  //     const { getSheetMatrix, } = require('../../app/redux/modules/sheets');

  //     getSheetMatrix(store.getState(), '0', graphFragment.json);

  //     return { state: store.getState(), getSheetMatrix, };
  //   },
  //   run: ({ state, getSheetMatrix, }) => {
  //     getSheetMatrix(state, '0', graphFragment.json);
  //   },
  // },
  {
    title: 'Update MaxColumn  ',
    init: () => {
      const store = initStore();
      delete require.cache[require.resolve('../../app/redux/modules/sheets')];
      const { getSheetMatrix, } = require('../../app/redux/modules/sheets');

      getSheetMatrix(store.getState(), '0', graphFragment.json);

      store.dispatch(increaseSheetMaxColumn('0'));

      return { state: store.getState(), getSheetMatrix, };
    },
    run: ({ state, getSheetMatrix, }) => {
      getSheetMatrix(state, '0', graphFragment.json);
    },
  },
  {
    title: 'Update MaxRow    ',
    init: () => {
      const store = initStore();
      delete require.cache[require.resolve('../../app/redux/modules/sheets')];
      const { getSheetMatrix, } = require('../../app/redux/modules/sheets');

      getSheetMatrix(store.getState(), '0', graphFragment.json);

      store.dispatch(increaseSheetMaxRow('0'));

      return { state: store.getState(), getSheetMatrix, };
    },
    run: ({ state, getSheetMatrix, }) => {
      getSheetMatrix(state, '0', graphFragment.json);
    },
  },
  {
    title: 'Update GraphFragment',
    init: () => {
      const store = initStore();
      delete require.cache[require.resolve('../../app/redux/modules/sheets')];
      const { getSheetMatrix, } = require('../../app/redux/modules/sheets');

      getSheetMatrix(store.getState(), '0', graphFragment.json);

      return { state: store.getState(), getSheetMatrix, jsonGraph: { ...graphFragment.json, }, };
    },
    run: ({ state, getSheetMatrix, jsonGraph, }) => {
      getSheetMatrix(state, '0', jsonGraph);
    },
  },
  {
    title: 'Update CellActive    ',
    init: () => {
      const store = initStore();
      delete require.cache[require.resolve('../../app/redux/modules/sheets')];
      const { getSheetMatrix, } = require('../../app/redux/modules/sheets');
      store.dispatch(setFocus({ sheetId: '0', column: 0, row: 0, }));

      getSheetMatrix(store.getState(), '0', graphFragment.json);

      store.dispatch(setFocus({ sheetId: '0', column: 1, row: 4, }));

      return { state: store.getState(), getSheetMatrix, };
    },
    run: ({ state, getSheetMatrix, }) => {
      getSheetMatrix(state, '0', graphFragment.json);
    },
  },
  {
    title: 'Update CellTeaser   ',
    init: () => {
      const store = initStore();
      delete require.cache[require.resolve('../../app/redux/modules/sheets')];
      const { getSheetMatrix, } = require('../../app/redux/modules/sheets');
      store.dispatch(teaseCell('0', 0, 0));

      getSheetMatrix(store.getState(), '0', graphFragment.json);

      store.dispatch(teaseCell('0', 1, 4));

      return { state: store.getState(), getSheetMatrix, };
    },
    run: ({ state, getSheetMatrix, }) => {
      getSheetMatrix(state, '0', graphFragment.json);
    },
  },
  {
    title: 'Update CellEnhanced   ',
    init: () => {
      const store = initStore();
      delete require.cache[require.resolve('../../app/redux/modules/sheets')];
      const { getSheetMatrix, } = require('../../app/redux/modules/sheets');

      getSheetMatrix(store.getState(), '0', graphFragment.json);

      store.dispatch(addEnhancedCell('0', 0, 0));

      return { state: store.getState(), getSheetMatrix, };
    },
    run: ({ state, getSheetMatrix, }) => {
      getSheetMatrix(state, '0', graphFragment.json);
    },
  },
  {
    title: 'Update CellInput    ',
    init: () => {
      const store = initStore();
      delete require.cache[require.resolve('../../app/redux/modules/sheets')];
      const { getSheetMatrix, } = require('../../app/redux/modules/sheets');

      getSheetMatrix(store.getState(), '0', graphFragment.json);

      store.dispatch(setCellInput('0', 0, 0, '!'));

      return { state: store.getState(), getSheetMatrix, };
    },
    run: ({ state, getSheetMatrix, }) => {
      getSheetMatrix(state, '0', graphFragment.json);
    },
  },
]);
